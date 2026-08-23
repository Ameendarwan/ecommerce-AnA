import { createServerSupabase } from '@/lib/supabase/server';
import { ProductType } from '@/types';
import { isMockMode } from '@/lib/mockMode';
import {
  getMockProducts,
  getMockProductById,
  getMockProductsByCategory,
  searchMockProducts,
} from '@/mock';

export const productServerService = {
  async getProducts(): Promise<ProductType[]> {
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
      console.error('Error in getProducts:', error);
      return [];
    }
  },

  async getProductById(id: string): Promise<ProductType | null> {
    if (isMockMode()) {
      return getMockProductById(id);
    }

    try {
      const supabase = await createServerSupabase();
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('product_id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        return null;
      }

      return data as ProductType;
    } catch (error) {
      console.error('Error in getProductById:', error);
      return null;
    }
  },

  async getProductsByCategory(categoryId: number): Promise<ProductType[]> {
    if (isMockMode()) {
      return getMockProductsByCategory(categoryId);
    }

    try {
      const supabase = await createServerSupabase();
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('category_id', categoryId)
        .order('title');

      if (error) {
        console.error('Error fetching products by category:', error);
        return [];
      }

      return data as ProductType[];
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      return [];
    }
  },

  async searchProducts(query: string): Promise<ProductType[]> {
    if (isMockMode()) {
      return searchMockProducts(query);
    }

    try {
      const supabase = await createServerSupabase();
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .ilike('title', `%${query}%`)
        .order('title');

      if (error) {
        console.error('Error searching products:', error);
        return [];
      }

      return data as ProductType[];
    } catch (error) {
      console.error('Error in searchProducts:', error);
      return [];
    }
  },
};
