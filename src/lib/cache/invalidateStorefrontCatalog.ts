import type { QueryClient } from '@tanstack/react-query';
import { productKeys, categoryKeys } from '@/hooks/queries';
import { revalidateCatalog } from '@/lib/cache/revalidateCatalog';

/**
 * Invalidate React Query catalog caches and Next.js RSC paths so the
 * storefront reflects admin / checkout stock changes immediately.
 */
export async function invalidateStorefrontCatalog(
  queryClient: QueryClient,
  options?: { productIds?: string[] }
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: productKeys.all }),
    queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
    revalidateCatalog(options?.productIds),
  ]);
}
