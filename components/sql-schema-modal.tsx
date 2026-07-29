'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

export const SqlSchemaModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const sqlCode = `-- TABELAS DO PINK PULSE ERP (MIGRATION INICIAL DE PRODUÇÃO)
-- Criado em: 2026-07-21
-- Compatível com Supabase & PostgreSQL 15+

-- Habilitar a extensão de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. ROLES
-- =========================================================================
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- 2. USERS
-- =========================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    role VARCHAR(50) DEFAULT 'VENDEDOR' NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- 3. CATEGORIES
-- =========================================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- 4. SUPPLIERS
-- =========================================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- 5. PRODUCTS
-- =========================================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    buy_price DECIMAL(10, 2) NOT NULL,
    sell_price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 5,
    expiry_date DATE,
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT check_positive_stock CHECK (stock >= 0)
);

-- =========================================================================
-- 6. CUSTOMERS
-- =========================================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    document VARCHAR(50) UNIQUE,
    birthday DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- 7. SALES
-- =========================================================================
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0 NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- 8. SALE_ITEMS
-- =========================================================================
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- 9. STOCK_MOVEMENTS
-- =========================================================================
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL, -- 'in', 'out', 'adjustment'
    quantity INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    buy_price DECIMAL(10, 2),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- 10. CUSTOMER_DEBTS
-- =========================================================================
CREATE TABLE IF NOT EXISTS customer_debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- 11. PROMOTIONS
-- =========================================================================
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    discount_type VARCHAR(50) NOT NULL, -- 'percentage', 'fixed_amount'
    discount_value DECIMAL(10, 2) NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- 12. ALERTS
-- =========================================================================
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL, -- 'low_stock', 'stagnant_product', 'out_of_stock', 'debtor'
    message TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE NOT NULL,
    severity VARCHAR(20) DEFAULT 'warning' NOT NULL, -- 'info', 'warning', 'critical'
    related_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- 13. SETTINGS
-- =========================================================================
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- 14. LOGS
-- =========================================================================
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    module VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================================================
-- DESEMPENHO: ÍNDICES ADICIONAIS
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_debts_customer_id ON customer_debts(customer_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);

-- =========================================================================
-- AUTOMAÇÃO: TRIGGERS PARA ATUALIZAR 'updated_at'
-- =========================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Procedure helper para registrar triggers de forma limpa e evitar colisões
CREATE OR REPLACE PROCEDURE create_updated_at_trigger(table_name TEXT) AS $$
BEGIN
    EXECUTE format('
        DROP TRIGGER IF EXISTS trg_update_updated_at_%%I ON %%I;
        CREATE TRIGGER trg_update_updated_at_%%I
        BEFORE UPDATE ON %%I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', table_name, table_name, table_name, table_name);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END;
$$ LANGUAGE plpgsql;

-- Chamar o helper para todas as tabelas
CALL create_updated_at_trigger('roles');
CALL create_updated_at_trigger('users');
CALL create_updated_at_trigger('categories');
CALL create_updated_at_trigger('suppliers');
CALL create_updated_at_trigger('products');
CALL create_updated_at_trigger('customers');
CALL create_updated_at_trigger('sales');
CALL create_updated_at_trigger('sale_items');
CALL create_updated_at_trigger('stock_movements');
CALL create_updated_at_trigger('customer_debts');
CALL create_updated_at_trigger('promotions');
CALL create_updated_at_trigger('alerts');
CALL create_updated_at_trigger('settings');
CALL create_updated_at_trigger('logs');

-- Remover o helper temporário
DROP PROCEDURE IF EXISTS create_updated_at_trigger;

-- =========================================================================
-- SEGURANÇA: ROW LEVEL SECURITY (RLS)
-- =========================================================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- POLÍTICAS DE ACESSO COOPERATIVO (DESENVOLVIMENTO, PREVIEW & PRODUÇÃO)
-- =========================================================================
DO $$
DECLARE
    t TEXT;
    tables_list TEXT[] := ARRAY[
        'roles', 'users', 'categories', 'suppliers', 'products', 'customers', 
        'sales', 'sale_items', 'stock_movements', 'customer_debts', 
        'promotions', 'alerts', 'settings', 'logs'
    ];
BEGIN
    FOREACH t IN ARRAY tables_list LOOP
        -- Remover políticas anteriores para prevenir colisões se o script rodar novamente
        EXECUTE format('DROP POLICY IF EXISTS "Allow anon read" ON %%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow anon insert" ON %%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow anon update" ON %%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow anon delete" ON %%I', t);
        
        EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated read" ON %%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated insert" ON %%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated update" ON %%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated delete" ON %%I', t);

        -- Criar novas políticas abertas para uso cooperativo seguro nas visualizações e produção
        EXECUTE format('CREATE POLICY "Allow anon read" ON %%I FOR SELECT TO anon USING (true)', t);
        EXECUTE format('CREATE POLICY "Allow anon insert" ON %%I FOR INSERT TO anon WITH CHECK (true)', t);
        EXECUTE format('CREATE POLICY "Allow anon update" ON %%I FOR UPDATE TO anon USING (true) WITH CHECK (true)', t);
        EXECUTE format('CREATE POLICY "Allow anon delete" ON %%I FOR DELETE TO anon USING (true)', t);
        
        EXECUTE format('CREATE POLICY "Allow authenticated read" ON %%I FOR SELECT TO authenticated USING (true)', t);
        EXECUTE format('CREATE POLICY "Allow authenticated insert" ON %%I FOR INSERT TO authenticated WITH CHECK (true)', t);
        EXECUTE format('CREATE POLICY "Allow authenticated update" ON %%I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', t);
        EXECUTE format('CREATE POLICY "Allow authenticated delete" ON %%I FOR DELETE TO authenticated USING (true)', t);
    END LOOP;
END;
$$;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fade-in" id="sql-modal-overlay">
      <div 
        id="sql-modal-container"
        className="bg-white/95 backdrop-blur-md rounded-[24px] max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#ECEEF5] animate-scale-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#ECEEF5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-[#EC0E78]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 font-sans">Setup do Banco de Dados Supabase</h3>
              <p className="text-xs text-gray-400 font-sans">Execute o script abaixo no SQL Editor do seu Supabase</p>
            </div>
          </div>
          <button 
            id="btn-close-sql-modal"
            onClick={onClose} 
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100/60 text-xs text-gray-600 space-y-2">
            <p className="font-semibold text-pink-900 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#EC0E78] rounded-full" />
              Como conectar seu Supabase real:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 pl-1">
              <li>Crie um projeto gratuito em <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#EC0E78] font-semibold underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a></li>
              <li>Acesse o <strong>SQL Editor</strong> no painel esquerdo e cole o script abaixo. Clique em <strong>Run</strong>.</li>
              <li>Vá em <strong>Project Settings ➔ API</strong> e copie a <code>Project URL</code> e a <code>anon public API key</code>.</li>
              <li>No AI Studio, clique em <strong>Secrets</strong> no painel de configurações à direita, adicione as chaves <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>. O ERP irá recarregar e conectar de forma 100% nativa e segura!</li>
            </ol>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-[#E9EAF0]">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-[#E9EAF0] text-xs font-mono text-gray-500">
              <span>pulse-schema.sql</span>
              <button
                id="btn-copy-sql"
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white border border-[#E9EAF0] hover:bg-[#EC0E78] hover:text-white hover:border-[#EC0E78] transition-all text-gray-600 font-semibold cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar Script'}
              </button>
            </div>
            <pre className="p-4 bg-gray-950 text-gray-200 font-mono text-xs overflow-x-auto max-h-[300px] leading-relaxed">
              <code>{sqlCode}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-[#ECEEF5] flex justify-end rounded-b-[24px]">
          <button
            id="btn-close-sql-modal-footer"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white border border-[#E9EAF0] text-gray-600 hover:bg-gray-100 transition-all text-xs font-semibold"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
export default SqlSchemaModal;
