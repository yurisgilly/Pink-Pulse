// Tipagem estrita para o Pink Pulse ERP

export enum UserRole {
  ADMIN = 'Administrador',
  GERENTE = 'Gerente',
  ESTOQUE = 'Estoque',
  VENDEDOR = 'Vendedor',
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  brand?: string;
  category_id?: string;
  supplier_id?: string;
  buy_price: number;
  sell_price: number;
  profit_margin?: number; // Calculado
  stock: number;
  min_stock: number;
  expiry_date?: string; // ISO date string
  image_url?: string;
  description?: string;
  active?: boolean;
  created_at: string;
}

export type PaymentMethod = 'money' | 'card' | 'pix' | 'debt';

export interface Sale {
  id: string;
  user_id: string;
  user_name?: string;
  customer_id?: string;
  customer_name?: string;
  total_amount: number;
  discount_amount: number;
  payment_method: PaymentMethod;
  status: 'completed' | 'cancelled';
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  product_name?: string;
  user_id: string;
  user_name?: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  buy_price?: number;
  supplier_id?: string;
  supplier_name?: string;
  notes?: string;
  created_at: string;
}

export interface Alert {
  id: string;
  type: 'low_stock' | 'expiry_warning' | 'expired' | 'debtor' | 'birthday';
  message: string;
  resolved: boolean;
  severity: 'warning' | 'danger' | 'info';
  related_id?: string;
  created_at: string;
}

export interface Debt {
  id: string;
  customer_id: string;
  customer_name?: string;
  sale_id: string;
  amount: number;
  due_date: string;
  paid: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  birthday?: string;
  notes?: string;
  created_at: string;
}

export interface Log {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  module: string;
  details?: string;
  created_at: string;
}

export interface ERPDataState {
  users: User[];
  categories: Category[];
  suppliers: Supplier[];
  products: Product[];
  sales: Sale[];
  saleItems: SaleItem[];
  stockMovements: StockMovement[];
  alerts: Alert[];
  debts: Debt[];
  customers: Customer[];
  logs: Log[];
}
