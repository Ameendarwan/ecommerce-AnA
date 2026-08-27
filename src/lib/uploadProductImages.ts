import { supabase } from '@/lib/supabase/client';

export const PRODUCT_IMAGES_BUCKET = 'product-images';

/**
 * Upload product images to Supabase Storage.
 * Returns public URLs in upload order.
 */
export async function uploadProductImages(
  files: File[],
  productIdHint?: string
): Promise<string[]> {
  if (!files.length) return [];

  const folder = productIdHint || crypto.randomUUID();
  const urls: string[] = [];

  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, file, {
        cacheControl: '31536000, public, immutable',
        upsert: false,
        contentType: file.type || 'image/jpeg',
      });

    if (error) {
      throw new Error(error.message || 'Failed to upload image');
    }

    const { data } = supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(path);

    urls.push(data.publicUrl);
  }

  return urls;
}
