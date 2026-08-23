import { supabase } from '@/lib/supabase/client';
import { ProductType } from '../../types';
import { isNoRowsError, toUserFacingQueryError } from '@/utils/errorHandling';
import { isMockMode } from '@/lib/mockMode';
import {
  getMockProducts,
  getMockProductById,
  getMockProductsByCategory,
} from '@/mock';

export const productService = {
  async getProducts(): Promise<ProductType[]> {
    if (isMockMode()) {
      return getMockProducts();
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
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
    if (isMockMode()) {
      return getMockProductById(id);
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('product_id', id)
        .single();

      if (error) {
        if (isNoRowsError(error)) {
          return null;
        }
        throw toUserFacingQueryError('Product', error);
      }

      return data as ProductType;
    } catch (error) {
      throw error instanceof Error
        ? error
        : toUserFacingQueryError('Product', {});
    }
  },

  async getProductsByCategory(categoryId: number): Promise<ProductType[]> {
    if (isMockMode()) {
      return getMockProductsByCategory(categoryId);
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('category_id', categoryId)
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
