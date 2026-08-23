import { createServerSupabase } from '@/lib/supabase/server';
import { ProductType } from '@/types';
import { isMockMode } from '@/lib/mockMode';
import { getMockProducts } from '@/mock';

export async function getProductsServer(): Promise<ProductType[]> {
  if (isMockMode()) {
    return getMockProducts();
  }

  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('title');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data as ProductType[];
  } catch (error) {
    console.error('Error in getProductsServer:', error);
    return [];
  }
}
