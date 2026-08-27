'use server';

import { revalidatePath } from 'next/cache';
import { createPublicSupabase } from '@/lib/supabase/server';

const FALLBACK_CATEGORY_PATHS = [
  '/shirts',
  '/shoes',
  '/bags',
  '/clothing',
  '/electronics',
  '/accessories',
] as const;

/**
 * Bust Next.js RSC caches for catalog pages after stock/product/category changes.
 */
export async function revalidateCatalog(productIds?: string[]) {
  revalidatePath('/');
  revalidatePath('/products', 'layout');
  revalidatePath('/cart');
  revalidatePath('/about');
  revalidatePath('/faq');

  for (const path of FALLBACK_CATEGORY_PATHS) {
    revalidatePath(path);
  }

  try {
    const supabase = createPublicSupabase();
    const { data: categories } = await supabase
      .from('categories')
      .select('name')
      .eq('is_visible', true);

    if (categories?.length) {
      for (const cat of categories) {
        if (cat.name) {
          const slug = cat.name.toLowerCase().trim().replace(/\s+/g, '-');
          revalidatePath(`/${slug}`);
          revalidatePath(`/${cat.name.toLowerCase().trim()}`);
        }
      }
    }
  } catch (err) {
    console.error('Error revalidating dynamic category paths:', err);
  }

  if (productIds?.length) {
    for (const id of productIds) {
      if (id) revalidatePath(`/products/${id}`);
    }
  }
}
