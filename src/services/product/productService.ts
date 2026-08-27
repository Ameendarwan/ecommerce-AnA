import { supabase } from '@/lib/supabase/client';
import { ProductType } from '../../types';
import { isNoRowsError, toUserFacingQueryError } from '@/utils/errorHandling';
import { normalizeProductId, isValidUuid } from '@/lib/utils';

export const productService = {
  async getProducts(): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_visible', true)
        .order('title');

      if (error) {
        throw toUserFacingQueryError('Products', error);
      }

      return data as ProductType[];
    } catch (error) {
      throw error instanceof Error
        ? error
        : toUserFacingQueryError('Products', {});
    }
  },

  async getProductById(id: string): Promise<ProductType | null> {
    try {
      const cleanId = normalizeProductId(id);
      if (!cleanId || !isValidUuid(cleanId)) {
        return null;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('product_id', cleanId)
        .eq('is_visible', true)
        .maybeSingle();

      if (error) {
        if (isNoRowsError(error)) {
          return null;
        }
        throw toUserFacingQueryError('Product', error);
      }

      return data as ProductType | null;
    } catch (error) {
      throw error instanceof Error
        ? error
        : toUserFacingQueryError('Product', {});
    }
  },

  async getProductsByCategory(categoryId: number): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('category_id', categoryId)
        .eq('is_visible', true)
        .order('title');

      if (error) {
        throw toUserFacingQueryError('Products', error);
      }

      return data as ProductType[];
    } catch (error) {
      throw error instanceof Error
        ? error
        : toUserFacingQueryError('Products', {});
    }
  },
};
