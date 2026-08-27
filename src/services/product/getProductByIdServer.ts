import { createServerSupabase } from '@/lib/supabase/server';
import { ProductType } from '@/types';
import { normalizeProductId, isValidUuid } from '@/lib/utils';

export async function getProductByIdServer(
  id: string
): Promise<ProductType | null> {
  try {
    const cleanId = normalizeProductId(id);
    if (!cleanId || !isValidUuid(cleanId)) {
      return null;
    }

    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('product_id', cleanId)
      .eq('is_visible', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data as ProductType | null;
  } catch (error) {
    console.error('Error in getProductByIdServer:', error);
    return null;
  }
}
