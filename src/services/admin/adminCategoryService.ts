import { supabase } from "@/lib/supabase/client";
import { CategoryType } from "@/types";

export interface CreateCategoryData {
  name: string;
  description?: string;
  is_visible?: boolean;
  parent_id?: number | null;
}

export type UpdateCategoryData = Partial<CreateCategoryData>;

export interface CategoryFilters {
  isVisible?: boolean;
}

export const adminCategoryService = {
  async getAllCategories(
    filters: CategoryFilters = {},
    page: number = 1,
    limit: number = 1000,
  ): Promise<{ categories: CategoryType[]; total: number }> {
    let query = supabase
      .from("categories")
      .select("*", { count: "exact" });

    if (filters.isVisible !== undefined) {
      query = query.eq("is_visible", filters.isVisible);
    }

    const { data, error, count } = await query
      .order("name")
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }

    return {
      categories: (data || []) as CategoryType[],
      total: count || 0,
    };
  },

  async createCategory(categoryData: CreateCategoryData): Promise<CategoryType> {
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: categoryData.name.trim(),
        description: categoryData.description?.trim() || "",
        is_visible: categoryData.is_visible ?? true,
        parent_id: categoryData.parent_id ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      throw error;
    }

    return data as CategoryType;
  },

  async updateCategory(
    id: number,
    categoryData: UpdateCategoryData,
  ): Promise<CategoryType> {
    const payload: Record<string, unknown> = {};
    if (categoryData.name !== undefined) {
      payload.name = categoryData.name.trim();
    }
    if (categoryData.description !== undefined) {
      payload.description = categoryData.description.trim();
    }
    if (categoryData.is_visible !== undefined) {
      payload.is_visible = categoryData.is_visible;
    }
    if (categoryData.parent_id !== undefined) {
      payload.parent_id = categoryData.parent_id;
    }

    const { data, error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating category:", error);
      throw error;
    }

    return data as CategoryType;
  },

  async deleteCategory(id: number): Promise<boolean> {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      throw error;
    }

    return true;
  },
};
