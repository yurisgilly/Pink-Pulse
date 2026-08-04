import { supabase, isSupabaseConfigured, getValidUserId } from '@/lib/supabase';
import { Category, Supplier, Customer, Log } from '@/types/erp.types';
import { logger } from '@/lib/logger';

export class ERPRepository {
  // --- LOGS ---
  static async addLog(action: string, module: string, details?: string, userId?: string | null): Promise<Log> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }

    const validUserId = await getValidUserId(userId);

    const { data, error } = await supabase.from('logs').insert([{
      user_id: validUserId,
      action,
      module,
      details
    }]).select('id, user_id, action, module, details, created_at').single();

    if (error || !data) {
      throw new Error(`Error adding log in Supabase: ${error?.message || 'No data returned'}`);
    }

    return data as Log;
  }

  static async getLogs(): Promise<Log[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }
    const { data, error } = await supabase
      .from('logs')
      .select('id, user_id, action, module, details, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching logs from Supabase: ${error.message}`);
    }

    return (data || []).map((l: any) => ({
      ...l,
      user_name: 'Manoela Rossi'
    })) as Log[];
  }

  // --- CATEGORIES ---
  static async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }
    const { data, error } = await supabase.from('categories').select('id, name, description, created_at').order('name');
    if (error) {
      throw new Error(`Error fetching categories from Supabase: ${error.message}`);
    }
    return (data || []) as Category[];
  }

  static async createCategory(name: string, description?: string): Promise<Category> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }
    const { data, error } = await supabase.from('categories').insert([{ name, description }]).select('id, name, description, created_at').single();
    if (error || !data) {
      throw new Error(`Error creating category in Supabase: ${error?.message || 'No data returned'}`);
    }
    await this.addLog('Categoria Criada', 'Estoque', `Categoria ${name} adicionada ao Supabase.`);
    return data as Category;
  }

  // --- SUPPLIERS ---
  static async getSuppliers(): Promise<Supplier[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }
    const { data, error } = await supabase.from('suppliers').select('id, name, cnpj, phone, email, address, created_at').order('name');
    if (error) {
      throw new Error(`Error fetching suppliers from Supabase: ${error.message}`);
    }
    return (data || []) as Supplier[];
  }

  static async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at'>): Promise<Supplier> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }
    const { data, error } = await supabase.from('suppliers').insert([supplier]).select('id, name, cnpj, phone, email, address, created_at').single();
    if (error || !data) {
      throw new Error(`Error creating supplier in Supabase: ${error?.message || 'No data returned'}`);
    }
    await this.addLog('Fornecedor Criado', 'Fornecedores', `Fornecedor ${supplier.name} adicionado ao Supabase.`);
    return data as Supplier;
  }

  static async deleteSupplier(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      return true;
    }
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) {
      logger.error('Erro ao deletar fornecedor no Supabase:', error.message);
      return false;
    }
    await this.addLog('Fornecedor Excluído', 'Fornecedores', `Fornecedor ID ${id} excluído do Supabase.`);
    return true;
  }

  // --- CUSTOMERS ---
  static async getCustomers(): Promise<Customer[]> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }
    const { data, error } = await supabase.from('customers').select('id, name, email, phone, document, birthday, notes, created_at').order('name');
    if (error) {
      throw new Error(`Error fetching customers from Supabase: ${error.message}`);
    }
    return (data || []) as Customer[];
  }

  static async createCustomer(customer: Omit<Customer, 'id' | 'created_at'>): Promise<Customer> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }
    const { data, error } = await supabase.from('customers').insert([customer]).select('id, name, email, phone, document, birthday, notes, created_at').single();
    if (error || !data) {
      throw new Error(`Error creating customer in Supabase: ${error?.message || 'No data returned'}`);
    }
    await this.addLog('Cliente Cadastrado', 'Clientes', `Cliente ${customer.name} adicionado ao Supabase.`);
    return data as Customer;
  }

  static async updateCustomer(id: string, customerData: Partial<Customer>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      return true;
    }
    const updateObj: any = {};
    if (customerData.name !== undefined) updateObj.name = customerData.name;
    if (customerData.phone !== undefined) updateObj.phone = customerData.phone;
    if (customerData.email !== undefined) updateObj.email = customerData.email;
    if (customerData.document !== undefined) updateObj.document = customerData.document;
    if (customerData.birthday !== undefined) updateObj.birthday = customerData.birthday;
    if (customerData.notes !== undefined) updateObj.notes = customerData.notes;

    const { error } = await supabase.from('customers').update(updateObj).eq('id', id);
    if (error) {
      logger.error('Erro ao atualizar cliente no Supabase:', error.message);
      return false;
    }
    await this.addLog('Cliente Atualizado', 'Clientes', `Cliente ${customerData.name || id} atualizado no Supabase.`);
    return true;
  }

  static async deleteCustomer(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      return true;
    }
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) {
      console.error('Erro ao excluir cliente no Supabase:', error.message);
      return false;
    }
    await this.addLog('Cliente Excluído', 'Clientes', `Cliente ID ${id} excluído do Supabase.`);
    return true;
  }
}
