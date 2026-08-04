import { supabase, isSupabaseConfigured, getValidUserId } from '@/lib/supabase';
import { Sale, SaleItem, Debt, PaymentMethod } from '@/types/erp.types';
import { ProductsRepository } from './products.repository';
import { ERPRepository } from './erp.repository';
import { logger } from '@/lib/logger';

export class SalesRepository {
  static async getSales(): Promise<Sale[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }
    const { data, error } = await supabase
      .from('sales')
      .select('id, user_id, customer_id, total_amount, discount_amount, payment_method, created_at, customers(name)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching sales from Supabase: ${error.message}`);
    }

    return (data || []).map((s: any) => ({
      ...s,
      customer_name: s.customers?.name || 'Consumidor Final'
    })) as Sale[];
  }

  static async getSaleItems(saleId: string): Promise<SaleItem[]> {
    if (!saleId || saleId.trim() === '') {
      return [];
    }
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }
    const { data, error } = await supabase
      .from('sale_items')
      .select('id, sale_id, product_id, quantity, unit_price, total_price, created_at, products(name)')
      .eq('sale_id', saleId);

    if (error) {
      throw new Error(`Error fetching sale items from Supabase: ${error.message}`);
    }

    return (data || []).map((i: any) => ({
      ...i,
      product_name: i.products?.name || 'Produto'
    })) as SaleItem[];
  }

  static async executeSale(
    items: { productId: string; quantity: number; unitPrice: number }[],
    paymentMethod: PaymentMethod,
    discountAmount: number,
    customerId?: string,
    userId?: string | null
  ): Promise<{ success: boolean; error?: string; sale?: Sale }> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return { success: false, error: 'A venda deve conter pelo menos um item.' };
    }

    const safeDiscount = Math.max(0, isNaN(Number(discountAmount)) ? 0 : Number(discountAmount));

    // Validar quantidades e preços recebidos
    for (const item of items) {
      const qty = Number(item.quantity);
      const price = Number(item.unitPrice);
      if (!item.productId || isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
        return { success: false, error: 'Quantidade de item inválida. Deve ser um número inteiro positivo.' };
      }
      if (isNaN(price) || price < 0 || !isFinite(price)) {
        return { success: false, error: 'Preço unitário do produto inválido.' };
      }
    }

    // 1. Validar estoques antes de qualquer coisa usando dados reais do banco
    const products = await ProductsRepository.getProducts();
    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) {
        return { success: false, error: 'Um dos produtos selecionados não foi encontrado.' };
      }
      if (prod.stock < item.quantity) {
        return { success: false, error: `Estoque insuficiente para o produto: ${prod.name}. Disponível: ${prod.stock}` };
      }
    }

    const rawTotal = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0);
    const totalAmount = Math.max(0, rawTotal - safeDiscount);
    const validUserId = await getValidUserId(userId);
    const validCustomerId = customerId && customerId.trim() !== '' ? customerId : null;

    // Registrar no Supabase Real
    const { data: saleData, error: saleErr } = await supabase.from('sales').insert([{
      user_id: validUserId,
      customer_id: validCustomerId,
      total_amount: totalAmount,
      discount_amount: safeDiscount,
      payment_method: paymentMethod
    }]).select('id, user_id, customer_id, total_amount, discount_amount, payment_method, created_at').single();

    if (saleErr || !saleData) {
      return { success: false, error: `Falha ao registrar a venda no Supabase: ${saleErr?.message || 'Erro desconhecido'}` };
    }

    // Inserir itens, decrementar estoque e criar movimentos
    for (const item of items) {
      const { error: itemErr } = await supabase.from('sale_items').insert([{
        sale_id: saleData.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.quantity * item.unitPrice
      }]);

      if (itemErr) {
        throw new Error(`Erro ao inserir item de venda no Supabase: ${itemErr.message}`);
      }

      // Decrementar o estoque diretamente na tabela products via ProductsRepository.updateStock (registra movimentações e alertas se necessário)
      await ProductsRepository.updateStock(item.productId, -item.quantity, 'out', 'sale', `Venda #${saleData.id}`, validUserId);
    }

    // Se for fiado / crediário, criar débito
    if (paymentMethod === 'debt' && customerId) {
      const { error: debtErr } = await supabase.from('customer_debts').insert([{
        customer_id: customerId,
        sale_id: saleData.id,
        amount: totalAmount,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 dias
      }]);

      if (debtErr) {
        throw new Error(`Erro ao registrar débito do cliente no Supabase: ${debtErr.message}`);
      }

      // Registrar alerta de inadimplência pendente
      const { data: custData } = await supabase.from('customers').select('name').eq('id', customerId).single();
      const customerName = custData?.name || 'Cliente';
      
      const { error: alertErr } = await supabase.from('alerts').insert([{
        type: 'debtor',
        message: `Nova fatura de R$ ${totalAmount.toFixed(2)} gerada para ${customerName} com vencimento em 30 dias.`,
        severity: 'info',
        related_id: customerId
      }]);

      if (alertErr) {
        logger.error(`Erro ao criar alerta de devedor: ${alertErr.message}`);
      }
    }

    await ERPRepository.addLog('Venda Finalizada', 'Vendas', `Venda #${saleData.id} de R$ ${totalAmount.toFixed(2)} efetuada no Supabase.`);
    return { success: true, sale: saleData as Sale };
  }

  static async getDebts(): Promise<Debt[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }
    const { data, error } = await supabase
      .from('customer_debts')
      .select('id, customer_id, sale_id, amount, due_date, paid, created_at, customers(name)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching customer debts from Supabase: ${error.message}`);
    }

    return (data || []).map((d: any) => ({
      ...d,
      customer_name: d.customers?.name || 'Cliente'
    })) as Debt[];
  }

  static async payDebt(debtId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }
    // Buscar valor e nome do cliente para log de auditoria
    const { data: debtData, error: fetchDebtErr } = await supabase
      .from('customer_debts')
      .select('amount, customers(name)')
      .eq('id', debtId)
      .single();

    if (fetchDebtErr || !debtData) {
      throw new Error(`Error fetching debt info: ${fetchDebtErr?.message || 'Debt not found'}`);
    }

    const { error: updateErr } = await supabase
      .from('customer_debts')
      .update({ paid: true })
      .eq('id', debtId);

    if (updateErr) {
      throw new Error(`Error updating debt state in Supabase: ${updateErr.message}`);
    }

    const customerName = (debtData as any).customers?.name || 'Cliente';
    const amount = debtData.amount;

    await ERPRepository.addLog('Dívida Paga', 'Financeiro', `Recebimento de fatura de R$ ${amount.toFixed(2)} de ${customerName}.`);
    return true;
  }
}
