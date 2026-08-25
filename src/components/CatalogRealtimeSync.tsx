'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { productKeys, categoryKeys } from '@/hooks/queries';

/**
 * Keeps storefront catalog in sync across machines via Supabase Realtime.
 * When admin (or checkout) changes products/categories, every open client
 * invalidates React Query and refetches immediately.
 */
export function CatalogRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const invalidateProducts = () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
    };
    const invalidateCategories = () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    };

    const channel = supabase
      .channel('storefront-catalog')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        invalidateProducts
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        invalidateCategories
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return null;
}
