'use server';

import { revalidatePath } from 'next/cache';

const CATEGORY_PATHS = [
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

  for (const path of CATEGORY_PATHS) {
    revalidatePath(path);
  }

  if (productIds?.length) {
    for (const id of productIds) {
      if (id) revalidatePath(`/products/${id}`);
    }
  }
}
