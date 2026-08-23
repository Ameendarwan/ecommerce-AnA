import { supabase } from '@/lib/supabase/client';
import { CategoryType } from '../../types';
import { isNoRowsError, toUserFacingQueryError } from '@/utils/errorHandling';
import { isMockMode } from '@/lib/mockMode';
import { getMockCategories, getMockCategoryById } from '@/mock';

export const categoryService = {
  async getCategories(): Promise<CategoryType[]> {
    if (isMockMode()) {
      return getMockCategories();
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        throw toUserFacingQueryError('Categories', error);
      }

      return data as CategoryType[];
    } catch (error) {
      throw error instanceof Error
        ? error
        : toUserFacingQueryError('Categories', {});
    }
  },

  async getCategoryById(id: number): Promise<CategoryType | null> {
    if (isMockMode()) {
      return getMockCategoryById(id);
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (isNoRowsError(error)) {
          return null;
        }
        throw toUserFacingQueryError('Category', error);
      }

      return data as CategoryType;
    } catch (error) {
      throw error instanceof Error
        ? error
        : toUserFacingQueryError('Category', {});
    }
  },
};
