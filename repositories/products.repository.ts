import { supabase, isSupabaseConfigured, getValidUserId } from '@/lib/supabase';
import { Product, StockMovement, Alert } from '@/types/erp.types';
import { ERPRepository } from './erp.repository';

export class ProductsRepository {
  static async getProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (error) {
      throw new Error(`Error fetching products from Supabase: ${error.message}`);
    }
    return ((data || []) as Product[]).filter(p => p.active !== false);
  }

  static async createProduct(product: Omit<Product, 'id' | 'sku' | 'created_at'>): Promise<Product> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }
    const sku = `PP-${product.name.slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const { data, error } = await supabase.from('products').insert([{ ...product, sku }]).select().single();
    if (error || !data) {
      throw new Error(`Error creating product in Supabase: ${error?.message || 'No data returned'}`);
    }

    if (product.stock > 0) {
      const validUserId = await getValidUserId(null);
      const { error: mError } = await supabase.from('stock_movements').insert([{
        product_id: data.id,
        user_id: validUserId,
        type: 'in',
        quantity: product.stock,
        reason: 'adjustment',
        notes: 'Estoque inicial de cadastro.'
      }]);
      if (mError) {
        console.error('Error inserting initial stock movement:', mError.message);
      }
    }

    await ERPRepository.addLog('Produto Criado', 'Estoque', `Produto ${product.name} (SKU: ${sku}) adicionado ao Supabase com ${product.stock} un.`);
    return data as Product;
  }

  static async updateProductFull(
    productId: string,
    updates: {
      name: string;
      barcode?: string;
      brand?: string;
      category_id: string;
      supplier_id: string;
      buy_price: number;
      sell_price: number;
      stock: number;
      min_stock: number;
      expiry_date?: string | null;
      image_url?: string;
      description?: string;
    },
    stockMovementReason?: string
  ): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      await ERPRepository.addLog('Produto Atualizado', 'Estoque', `Produto ${updates.name} atualizado.`);
      return true;
    }

    const { data: currentProduct } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();

    const oldStock = currentProduct?.stock ?? updates.stock;
    const stockDiff = updates.stock - oldStock;

    const updatePayload: Record<string, any> = {
      name: updates.name,
      barcode: updates.barcode || null,
      brand: updates.brand || null,
      category_id: updates.category_id,
      supplier_id: updates.supplier_id,
      buy_price: updates.buy_price,
      sell_price: updates.sell_price,
      stock: updates.stock,
      min_stock: updates.min_stock,
      expiry_date: updates.expiry_date || null,
      updated_at: new Date().toISOString()
    };

    if (updates.image_url !== undefined) {
      updatePayload.image_url = updates.image_url;
    }

    if (updates.description !== undefined) {
      updatePayload.description = updates.description;
    }

    const { error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', productId);

    if (error) {
      throw new Error(`Erro ao atualizar produto no Supabase: ${error.message}`);
    }

    if (stockDiff !== 0) {
      const validUserId = await getValidUserId(null);
      await supabase.from('stock_movements').insert([{
        product_id: productId,
        user_id: validUserId,
        type: stockDiff > 0 ? 'in' : 'out',
        quantity: Math.abs(stockDiff),
        reason: stockMovementReason || 'adjustment',
        notes: `Ajuste geral de cadastro. Estoque alterado de ${oldStock} para ${updates.stock}.`
      }]);
    }

    await ERPRepository.addLog('Produto Atualizado', 'Estoque', `Produto ${updates.name} editado com sucesso.`);
    return true;
  }

  static async updateStock(productId: string, quantityChange: number, type: 'in' | 'out' | 'adjustment', reason: string, notes?: string, userId?: string | null): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }

    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('stock, min_stock, name')
      .eq('id', productId)
      .single();

    if (fetchError || !currentProduct) {
      throw new Error(`Error fetching product for stock update: ${fetchError?.message || 'Product not found'}`);
    }

    const nextStock = currentProduct.stock + quantityChange;
    if (nextStock < 0) {
      throw new Error(`Estoque insuficiente para o produto: ${currentProduct.name}. Disponível: ${currentProduct.stock}`);
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: nextStock })
      .eq('id', productId);

    if (updateError) {
      throw new Error(`Error updating stock in Supabase: ${updateError.message}`);
    }

    const validUserId = await getValidUserId(userId);

    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert([{
        product_id: productId,
        user_id: validUserId,
        type,
        quantity: quantityChange,
        reason,
        notes
      }]);

    if (movementError) {
      throw new Error(`Error recording stock movement in Supabase: ${movementError.message}`);
    }

    if (nextStock <= currentProduct.min_stock) {
      const { error: alertError } = await supabase
        .from('alerts')
        .insert([{
          type: 'low_stock',
          message: `Estoque crítico para ${currentProduct.name}! Apenas ${nextStock} unidades em estoque (Mínimo: ${currentProduct.min_stock}).`,
          severity: 'warning',
          related_id: productId
        }]);
      if (alertError) {
        console.error(`Error inserting low stock alert in Supabase: ${alertError.message}`);
      }
    }

    await ERPRepository.addLog('Ajuste de Estoque', 'Estoque', `Ajuste de ${quantityChange} un. para ${currentProduct.name} no Supabase.`);
    return true;
  }

  static async getMovements(): Promise<StockMovement[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }
    const { data, error } = await supabase
      .from('stock_movements')
      .select('*, products(name)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching stock movements from Supabase: ${error.message}`);
    }

    return (data || []).map((m: any) => ({
      ...m,
      product_name: m.products?.name || 'Produto Removido'
    })) as StockMovement[];
  }

  static async getAlerts(): Promise<Alert[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching alerts from Supabase: ${error.message}`);
    }

    return (data || []) as Alert[];
  }

  static async resolveAlert(alertId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }
    const { error } = await supabase
      .from('alerts')
      .update({ resolved: true })
      .eq('id', alertId);

    if (error) {
      throw new Error(`Error resolving alert in Supabase: ${error.message}`);
    }
    return true;
  }

  static async updateProductImage(productId: string, imageUrl: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      // Demo / fallback mode without Supabase connection
      await ERPRepository.addLog('Foto do Produto Alterada', 'Estoque', `Foto do produto (${productId}) atualizada para nova URL.`);
      return true;
    }
    const { error } = await supabase
      .from('products')
      .update({ image_url: imageUrl })
      .eq('id', productId);

    if (error) {
      throw new Error(`Error updating product image in Supabase: ${error.message}`);
    }
    await ERPRepository.addLog('Foto do Produto Alterada', 'Estoque', `Foto do produto (${productId}) atualizada com sucesso.`);
    return true;
  }

  static async deleteProduct(productId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      await ERPRepository.addLog('Produto Desativado', 'Estoque', `Produto ID ${productId} desativado do sistema.`);
      return true;
    }
    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', productId);

    if (error) {
      throw new Error(`Erro ao desativar produto no Supabase: ${error.message}`);
    }
    await ERPRepository.addLog('Produto Desativado', 'Estoque', `Produto ID ${productId} desativado com sucesso no Supabase.`);
    return true;
  }
}
