-- Migration para Buckets de Armazenamento de Imagens do Pink Pulse ERP
-- Buckets: product-images, user-avatars

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de RLS para acesso público de leitura e escrita
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public Storage Read" ON storage.objects;
  DROP POLICY IF EXISTS "Public Storage Insert" ON storage.objects;
  DROP POLICY IF EXISTS "Public Storage Update" ON storage.objects;
  DROP POLICY IF EXISTS "Public Storage Delete" ON storage.objects;

  CREATE POLICY "Public Storage Read" ON storage.objects FOR SELECT USING (bucket_id IN ('product-images', 'user-avatars'));
  CREATE POLICY "Public Storage Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('product-images', 'user-avatars'));
  CREATE POLICY "Public Storage Update" ON storage.objects FOR UPDATE USING (bucket_id IN ('product-images', 'user-avatars'));
  CREATE POLICY "Public Storage Delete" ON storage.objects FOR DELETE USING (bucket_id IN ('product-images', 'user-avatars'));
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END;
$$;
