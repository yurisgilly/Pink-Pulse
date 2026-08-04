import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Validates file type and size.
 * Returns null if valid, or an error message string if invalid.
 */
export function validateImageFile(file: File): string | null {
  const fileType = file.type.toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const isValidMime = ALLOWED_MIME_TYPES.includes(fileType) && ALLOWED_EXTENSIONS.includes(ext);

  if (!isValidMime) {
    return 'Formato de imagem inválido. Apenas arquivos JPG, JPEG, PNG e WEBP são permitidos.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'O tamanho da imagem excede o limite máximo permitido de 5 MB.';
  }
  return null;
}

/**
 * Uploads an image file to Supabase Storage or falls back to Data URL.
 * Returns the public URL or Data URL string of the uploaded image.
 */
export async function uploadImageToStorage(
  bucket: 'product-images' | 'user-avatars',
  file: File,
  oldFilePath?: string
): Promise<string> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  // 1. Try uploading to Supabase Storage if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileExt = ALLOWED_EXTENSIONS.includes(rawExt) ? rawExt : 'jpg';
      const cleanFileName = file.name.substring(0, file.name.lastIndexOf('.')).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50);
      const fileName = `${Date.now()}_${cleanFileName}.${fileExt}`;
      const filePath = fileName;

      // Attempt to remove previous file if it belonged to this bucket
      if (oldFilePath && oldFilePath.includes(bucket)) {
        try {
          const pathParts = oldFilePath.split(`${bucket}/`);
          if (pathParts.length > 1) {
            const relativeOldPath = pathParts[1].split('?')[0].replace(/\.\./g, '').replace(/^\/+/, '');
            if (relativeOldPath) {
              await supabase.storage.from(bucket).remove([relativeOldPath]);
            }
          }
        } catch (removeErr) {
          console.warn('[Storage] Não foi possível remover a imagem antiga:', removeErr);
        }
      }

      // Upload file to bucket
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.warn(`[Supabase Storage] Falha ao enviar para o bucket '${bucket}': ${error.message}. Utilizando fallback DataURL.`);
        return await readFileAsDataURL(file);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn('[Supabase Storage] Exceção durante upload:', err);
      return await readFileAsDataURL(file);
    }
  }

  // 2. Demo mode / Fallback without active Supabase
  return await readFileAsDataURL(file);
}

/**
 * Reads a File object and converts it to a base64 Data URL string.
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
