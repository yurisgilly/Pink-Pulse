'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, Category, Supplier, Customer, Sale, Alert, Debt, StockMovement, Log, PaymentMethod, User, UserRole 
} from '@/types/erp.types';
import { ERPRepository } from '@/repositories/erp.repository';
import { ProductsRepository } from '@/repositories/products.repository';
import { SalesRepository } from '@/repositories/sales.repository';
import { ERPService } from '@/services/erp.service';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { parseBirthday } from '@/lib/utils';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from '@/lib/default-data';

export type ActiveTab = 
  | 'dashboard' 
  | 'sales' 
  | 'receipts'
  | 'products' 
  | 'stock' 
  | 'catalog'
  | 'public_catalog'
  | 'promotions' 
  | 'customers' 
  | 'debts' 
  | 'reports' 
  | 'ai' 
  | 'users' 
  | 'suppliers' 
  | 'finance' 
  | 'alerts';

interface CartItem {
  product: Product;
  quantity: number;
}

interface ERPContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  customers: Customer[];
  sales: Sale[];
  alerts: Alert[];
  debts: Debt[];
  movements: StockMovement[];
  logs: Log[];
  loading: boolean;
  refreshAll: () => Promise<void>;
  
  // PDV / Carrinho
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  executeCheckout: (paymentMethod: PaymentMethod, discount: number, customerId?: string) => Promise<{ success: boolean; error?: string; sale?: Sale }>;

  // Métricas do Dashboard
  dashboardMetrics: any;
  
  // Estado de conexão Supabase
  supabaseConnected: boolean;

  // Usuários & Autenticação
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  createUser: (user: Omit<User, 'id' | 'created_at'>) => Promise<User | null>;
  updateUser: (id: string, user: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;

  // Fornecedores
  createSupplier: (supplier: Omit<Supplier, 'id' | 'created_at'>) => Promise<Supplier | null>;
  deleteSupplier: (id: string) => Promise<boolean>;

  // Clientes
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;

  // Produtos
  updateProductFull: (
    id: string,
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
  ) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);

  // Usuários & Autenticação
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const computeBirthdayAlerts = (customerList: Customer[]): Alert[] => {
    const birthdayAlerts: Alert[] = [];
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    let resolvedBirthdayAlertIds: string[] = [];
    try {
      const saved = localStorage.getItem('pink_pulse_resolved_birthday_alerts');
      if (saved) resolvedBirthdayAlertIds = JSON.parse(saved);
    } catch (e) {
      resolvedBirthdayAlertIds = [];
    }

    (customerList || []).forEach(c => {
      if (c.birthday) {
        const parsed = parseBirthday(c.birthday);
        if (parsed && parsed.month === currentMonth) {
          const alertId = `bday-${c.id}-${currentMonth}`;
          if (!resolvedBirthdayAlertIds.includes(alertId)) {
            const isToday = parsed.day === currentDay;
            const daysLeft = parsed.day - currentDay;

            let message = '';
            if (isToday) {
              message = `🎉 HOJE é Aniversário de ${c.name}! O aniversário é hoje (Dia ${String(parsed.day).padStart(2, '0')}/${String(parsed.month).padStart(2, '0')}). Envie os parabéns da equipe Pink Pulse e ofereça o cupom VIP "PARABENS10"!`;
            } else if (daysLeft > 0) {
              message = `🎂 Aniversário de ${c.name} se aproxima em ${daysLeft} dia(s) (Dia ${String(parsed.day).padStart(2, '0')}/${String(parsed.month).padStart(2, '0')})! Prepare o cupom de desconto ou envie felicitações.`;
            } else {
              message = `🎈 Aniversariante deste mês: ${c.name} (Dia ${String(parsed.day).padStart(2, '0')}/${String(parsed.month).padStart(2, '0')}). Aproveite para presentear com um cupom especial Pink Pulse!`;
            }

            birthdayAlerts.push({
              id: alertId,
              type: 'birthday',
              message,
              resolved: false,
              severity: isToday ? 'danger' : 'warning',
              related_id: c.id,
              created_at: new Date().toISOString()
            });
          }
        }
      }
    });

    return birthdayAlerts;
  };

  const refreshAll = async () => {
    try {
      setLoading(true);

      if (!isSupabaseConfigured || !supabase) {
        // Se o Supabase não estiver configurado ainda, inicializamos com estados vazios e usuários demo padrão
        const currentYear = new Date().getFullYear();
        const currentMonthNum = new Date().getMonth() + 1;
        const currentMonthStr = String(currentMonthNum).padStart(2, '0');
        const currentDayStr = String(new Date().getDate()).padStart(2, '0');

        const demoCustomers: Customer[] = [
          {
            id: 'cust-1',
            name: 'Alessandra Ambrósio',
            email: 'alessandra@pinkpulse.com',
            phone: '(11) 97123-4567',
            document: '123.456.789-00',
            birthday: `${currentYear-28}-${currentMonthStr}-${currentDayStr}`,
            notes: 'Preferência por linhas de tratamento capilar e perfumes florais.',
            created_at: '2026-01-20T11:00:00Z'
          },
          {
            id: 'cust-2',
            name: 'Camila Coelho',
            email: 'camila@pinkpulse.com',
            phone: '(21) 98234-5678',
            document: '987.654.321-11',
            birthday: `${currentYear-30}-${currentMonthStr}-28`,
            notes: 'Cliente VIP recorrente de maquiagens.',
            created_at: '2026-02-10T15:20:00Z'
          }
        ];

        let localProds: Product[] = DEFAULT_PRODUCTS;
        let localCats: Category[] = DEFAULT_CATEGORIES;
        try {
          const savedP = localStorage.getItem('pink_pulse_products');
          if (savedP) localProds = JSON.parse(savedP);
          const savedC = localStorage.getItem('pink_pulse_categories');
          if (savedC) localCats = JSON.parse(savedC);
        } catch (e) {}

        setProducts(localProds);
        setCategories(localCats);
        setSuppliers([
          {
            id: 'sup-1',
            name: 'LVMH Pulse Cosmetics',
            cnpj: '12.345.678/0001-90',
            phone: '(11) 98765-4321',
            email: 'comercial@lvmhpulse.com',
            address: 'Av. Paulista, 1000 - São Paulo, SP',
            created_at: '2026-01-15T10:00:00Z'
          },
          {
            id: 'sup-2',
            name: 'Intimate Care Importadora',
            cnpj: '98.765.432/0001-10',
            phone: '(21) 99887-6655',
            email: 'contato@intimatecare.com.br',
            address: 'Rua das Flores, 500 - Rio de Janeiro, RJ',
            created_at: '2026-02-01T14:30:00Z'
          }
        ]);
        setCustomers(demoCustomers);
        setSales([]);
        const demoBdayAlerts = computeBirthdayAlerts(demoCustomers);
        setAlerts(demoBdayAlerts);
        setDebts([]);
        setMovements([]);
        setLogs([]);
        setUsers([
          { id: 'usr-1', name: 'Manoela Rossi', email: 'manoela@pinkpulse.com', role: UserRole.ADMIN, active: true, created_at: '2026-01-10T10:00:00Z' },
          { id: 'usr-2', name: 'Augusto César', email: 'augusto@pinkpulse.com', role: UserRole.ESTOQUE, active: true, created_at: '2026-02-15T09:30:00Z' },
          { id: 'usr-3', name: 'Gabriela Duarte', email: 'gabriela@pinkpulse.com', role: UserRole.VENDEDOR, active: true, created_at: '2026-03-01T14:00:00Z' },
        ]);
        setDashboardMetrics({
          totalRevenue: 0,
          totalSales: 0,
          lowStockCount: 0,
          pendingDebts: 0,
          categoryStats: [],
          recentSales: []
        });
        return;
      }

      const [p, c, s, cust, sl, al, db, mv, lg, fetchedUsers] = await Promise.all([
        ProductsRepository.getProducts(),
        ERPRepository.getCategories(),
        ERPRepository.getSuppliers(),
        ERPRepository.getCustomers(),
        SalesRepository.getSales(),
        ProductsRepository.getAlerts(),
        SalesRepository.getDebts(),
        ProductsRepository.getMovements(),
        ERPRepository.addLog('Sincronização de Dados', 'Sistema', 'Métricas recarregadas com sucesso.')
          .then(() => ERPRepository.getLogs())
          .catch(() => [] as Log[]),
        (async () => {
          const client = supabase;
          const { data, error } = await client.from('users').select('*').order('name');
          if (!error && data) return data as User[];
          return [] as User[];
        })()
      ]);

      setProducts(p);
      setCategories(c);
      setSuppliers(s);
      setCustomers(cust);
      setSales(sl);
      
      const bdayAlerts = computeBirthdayAlerts(cust);
      setAlerts([...bdayAlerts, ...(al || [])]);

      setDebts(db);
      setMovements(mv);
      setLogs(lg);
      setUsers(fetchedUsers);

      // Calcular métricas reais do dashboard
      const metrics = await ERPService.getDashboardMetrics();
      setDashboardMetrics(metrics);
    } catch (error) {
      console.error('Erro ao recarregar ERP:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      // Check auth state
      client.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          client.from('users').select('*').eq('email', session.user.email).single().then(({ data, error }) => {
            if (!error && data) {
              setCurrentUser(data as User);
            } else if (session.user.email) {
              setCurrentUser({
                id: session.user.id,
                name: session.user.user_metadata?.name || session.user.email.split('@')[0],
                email: session.user.email,
                role: UserRole.ADMIN,
                active: true,
                created_at: session.user.created_at
              });
            }
          });
        } else {
          const localUser = localStorage.getItem('pink_pulse_user');
          if (localUser) {
            setCurrentUser(JSON.parse(localUser));
          }
        }
      });

      const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          const { data, error } = await client.from('users').select('*').eq('email', session.user.email).single();
          if (!error && data) {
            setCurrentUser(data as User);
          }
        } else {
          setCurrentUser(null);
        }
      });

      setTimeout(() => {
        refreshAll();
      }, 0);

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setTimeout(() => {
        const localUser = localStorage.getItem('pink_pulse_user');
        if (localUser) {
          setCurrentUser(JSON.parse(localUser));
        }
        refreshAll();
      }, 0);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      
      const { data: profile, error: profileError } = await client.from('users').select('*').eq('email', email).single();
      if (!profileError && profile) {
        if (!profile.active) {
          return { success: false, error: 'Este usuário está inativo no sistema.' };
        }
        setCurrentUser(profile as User);
        localStorage.setItem('pink_pulse_user', JSON.stringify(profile));
        await refreshAll();
        return { success: true };
      }
      return { success: true };
    }

    // Default mock users for demo mode
    const demoUsers = [
      { id: 'usr-1', name: 'Manoela Rossi', email: 'manoela@pinkpulse.com', role: UserRole.ADMIN, active: true, created_at: '2026-01-10T10:00:00Z' },
      { id: 'usr-2', name: 'Augusto César', email: 'augusto@pinkpulse.com', role: UserRole.ESTOQUE, active: true, created_at: '2026-02-15T09:30:00Z' },
      { id: 'usr-3', name: 'Gabriela Duarte', email: 'gabriela@pinkpulse.com', role: UserRole.VENDEDOR, active: true, created_at: '2026-03-01T14:00:00Z' },
    ];

    const matched = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setCurrentUser(matched as User);
      localStorage.setItem('pink_pulse_user', JSON.stringify(matched));
      await refreshAll();
      return { success: true };
    }
    return { success: false, error: 'E-mail incorreto no modo de demonstração. Use um dos e-mails de usuário (ex: manoela@pinkpulse.com).' };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      await client.auth.signOut();
    }
    setCurrentUser(null);
    localStorage.removeItem('pink_pulse_user');
    setActiveTab('dashboard');
  };

  const createUser = async (user: Omit<User, 'id' | 'created_at'>): Promise<User | null> => {
    if (!isSupabaseConfigured || !supabase) {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        role: user.role,
        active: user.active,
        created_at: new Date().toISOString()
      };
      setUsers(prev => [...prev, newUser]);
      return newUser;
    }
    const client = supabase;
    const { data, error } = await client.from('users').insert([{
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      avatar_url: user.avatar_url || null,
      role: user.role,
      active: user.active
    }]).select().single();
    
    if (error || !data) {
      throw new Error(`Error creating user in Supabase: ${error?.message || 'No data returned'}`);
    }
    await refreshAll();
    return data as User;
  };

  const updateUser = async (id: string, updatedData: Partial<User>): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedData } : u));
      if (currentUser?.id === id) {
        setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
      }
      return true;
    }
    const client = supabase;
    const updateObj: any = {};
    if (updatedData.name !== undefined) updateObj.name = updatedData.name;
    if (updatedData.email !== undefined) updateObj.email = updatedData.email;
    if (updatedData.phone !== undefined) updateObj.phone = updatedData.phone;
    if (updatedData.avatar_url !== undefined) updateObj.avatar_url = updatedData.avatar_url;
    if (updatedData.role !== undefined) updateObj.role = updatedData.role;
    if (updatedData.active !== undefined) updateObj.active = updatedData.active;

    const { error } = await client.from('users').update(updateObj).eq('id', id);

    if (error) {
      throw new Error(`Error updating user in Supabase: ${error.message}`);
    }

    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
    }
    await refreshAll();
    return true;
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured or initialized.');
    }
    const client = supabase;
    const { error } = await client.from('users').delete().eq('id', id);
    
    if (error) {
      throw new Error(`Error deleting user from Supabase: ${error.message}`);
    }
    await refreshAll();
    return true;
  };

  // --- FORNECEDORES ---
  const createSupplier = async (supplierData: Omit<Supplier, 'id' | 'created_at'>): Promise<Supplier | null> => {
    if (!isSupabaseConfigured || !supabase) {
      const newSup: Supplier = {
        id: `sup-${Date.now()}`,
        name: supplierData.name,
        cnpj: supplierData.cnpj,
        phone: supplierData.phone,
        email: supplierData.email,
        address: supplierData.address,
        created_at: new Date().toISOString()
      };
      setSuppliers(prev => [...prev, newSup]);
      return newSup;
    }
    const result = await ERPRepository.createSupplier(supplierData);
    await refreshAll();
    return result;
  };

  const deleteSupplier = async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
      return true;
    }
    const success = await ERPRepository.deleteSupplier(id);
    if (success) {
      await refreshAll();
    }
    return success;
  };

  // --- CLIENTES ---
  const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customerData } : c));
      return true;
    }
    const success = await ERPRepository.updateCustomer(id, customerData);
    if (success) {
      await refreshAll();
    }
    return success;
  };

  const deleteCustomer = async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      return true;
    }
    const success = await ERPRepository.deleteCustomer(id);
    if (success) {
      await refreshAll();
    }
    return success;
  };

  // --- PRODUTOS ---
  const updateProductFull = async (
    id: string,
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
  ): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      setProducts(prev => prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            name: updates.name,
            barcode: updates.barcode,
            brand: updates.brand,
            category_id: updates.category_id,
            supplier_id: updates.supplier_id,
            buy_price: updates.buy_price,
            sell_price: updates.sell_price,
            stock: updates.stock,
            min_stock: updates.min_stock,
            expiry_date: updates.expiry_date || undefined,
            image_url: updates.image_url || p.image_url,
            description: updates.description ?? p.description
          };
        }
        return p;
      }));
      return true;
    }

    const success = await ProductsRepository.updateProductFull(id, updates, stockMovementReason);
    if (success) {
      await refreshAll();
    }
    return success;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      setProducts(prev => prev.filter(p => p.id !== id));
      return true;
    }
    const success = await ProductsRepository.deleteProduct(id);
    if (success) {
      await refreshAll();
    }
    return success;
  };

  // --- CARRINHO / PDV ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev => {
      const prod = prev.find(item => item.product.id === productId);
      if (!prod) return prev;
      if (quantity <= 0) return prev.filter(item => item.product.id !== productId);
      if (quantity > prod.product.stock) return prev; // Evitar ultrapassar estoque
      return prev.map(item => item.product.id === productId ? { ...item, quantity } : item);
    });
  };

  const clearCart = () => setCart([]);

  const executeCheckout = async (paymentMethod: PaymentMethod, discount: number, customerId?: string) => {
    const items = cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      unitPrice: item.product.sell_price
    }));

    const result = await SalesRepository.executeSale(items, paymentMethod, discount, customerId, currentUser?.id);
    if (result.success) {
      setCart([]);
      await refreshAll();
    }
    return result;
  };

  return (
    <ERPContext.Provider value={{
      activeTab,
      setActiveTab,
      products,
      categories,
      suppliers,
      customers,
      sales,
      alerts,
      debts,
      movements,
      logs,
      loading,
      refreshAll,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      executeCheckout,
      dashboardMetrics,
      supabaseConnected: isSupabaseConfigured,
      currentUser,
      users,
      login,
      logout,
      createUser,
      updateUser,
      deleteUser,
      createSupplier,
      deleteSupplier,
      updateCustomer,
      deleteCustomer,
      updateProductFull,
      deleteProduct
    }}>
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) throw new Error('useERP deve ser usado dentro de um ERPProvider');
  return context;
};
