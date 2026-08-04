-- Migration: Remove Anonymous Write Permissions and Secure RLS & Storage
-- Ensures anon role has only SELECT access to public catalog tables and product-images/user-avatars read.
-- Requires authenticated role for all INSERT, UPDATE, DELETE database and storage operations.

DO $$
DECLARE
    t TEXT;
    all_tables TEXT[] := ARRAY[
        'roles', 'users', 'categories', 'suppliers', 'products', 'customers', 
        'sales', 'sale_items', 'stock_movements', 'customer_debts', 
        'promotions', 'alerts', 'settings', 'logs'
    ];
    public_read_tables TEXT[] := ARRAY['products', 'categories', 'promotions', 'settings'];
BEGIN
    -- 1. Ensure RLS is enabled on all tables
    FOREACH t IN ARRAY all_tables LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;

    -- 2. Drop all previous policies on all tables
    FOREACH t IN ARRAY all_tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow anon read" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow anon insert" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow anon update" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow anon delete" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated read" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated insert" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated update" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated delete" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Public Catalog Read" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated Full Access" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Anon Write Fallback" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated full" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow anon full fallback" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow public catalog select" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated full access" ON %I', t);
    END LOOP;

    -- 3. Create SELECT policies for anon role strictly on public catalog tables
    FOREACH t IN ARRAY public_read_tables LOOP
        EXECUTE format('CREATE POLICY "Allow public catalog select" ON %I FOR SELECT TO anon USING (true)', t);
    END LOOP;

    -- 4. Create full CRUD access policies for authenticated users on all tables
    FOREACH t IN ARRAY all_tables LOOP
        EXECUTE format('CREATE POLICY "Allow authenticated full access" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
    END LOOP;
END;
$$;

-- 5. Storage Buckets Security Hardening
-- Restricts Storage INSERT, UPDATE, DELETE to authenticated users only
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public Storage Read" ON storage.objects;
  DROP POLICY IF EXISTS "Public Storage Insert" ON storage.objects;
  DROP POLICY IF EXISTS "Public Storage Update" ON storage.objects;
  DROP POLICY IF EXISTS "Public Storage Delete" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated Storage Read" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated Storage Insert" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated Storage Update" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated Storage Delete" ON storage.objects;

  -- Public read access for images (catalog visual support)
  CREATE POLICY "Public Storage Read" ON storage.objects 
    FOR SELECT 
    TO public 
    USING (bucket_id IN ('product-images', 'user-avatars'));

  -- Authenticated-only write permissions (upload, update, delete)
  CREATE POLICY "Authenticated Storage Insert" ON storage.objects 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (bucket_id IN ('product-images', 'user-avatars'));

  CREATE POLICY "Authenticated Storage Update" ON storage.objects 
    FOR UPDATE 
    TO authenticated 
    USING (bucket_id IN ('product-images', 'user-avatars')) 
    WITH CHECK (bucket_id IN ('product-images', 'user-avatars'));

  CREATE POLICY "Authenticated Storage Delete" ON storage.objects 
    FOR DELETE 
    TO authenticated 
    USING (bucket_id IN ('product-images', 'user-avatars'));
END;
$$;
