import { CategoryType } from '@/types';
import { categoryService } from '@/services/category/categoryService';

export async function getCategoryById(
  id: number
): Promise<CategoryType | null> {
  return categoryService.getCategoryById(id);
}
