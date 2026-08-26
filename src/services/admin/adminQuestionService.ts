import { supabase } from "@/lib/supabase/client";
import { QuestionStatus, QuestionType } from "@/types";

export interface QuestionWithDetails extends QuestionType {
  product?: {
    product_id: string;
    title: string;
    image?: string | null;
    category_id?: number | null;
    category?: {
      id: number;
      name: string;
    } | null;
  };
}

export interface QuestionFilters {
  categoryId?: number;
  productId?: string;
  status?: QuestionStatus;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Admin service for product question management
 */
export const adminQuestionService = {
  async getAllQuestions(
    filters: QuestionFilters = {},
    page: number = 1,
    limit: number = 50,
  ): Promise<{ questions: QuestionWithDetails[]; total: number }> {
    try {
      const needsProductInner = Boolean(filters.categoryId);

      const productsJoin = needsProductInner
        ? "products!questions_product_id_fkey!inner"
        : "products!questions_product_id_fkey";

      let query = supabase.from("questions").select(
        `
					*,
					${productsJoin} (
						product_id,
						title,
						image,
						category_id,
						categories!products_category_id_fkey (
							id,
							name
						)
					)
				`,
        { count: "exact" },
      );

      if (filters.productId) {
        query = query.eq("product_id", filters.productId);
      }
      if (filters.categoryId) {
        query = query.eq("products.category_id", filters.categoryId);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        const end = filters.dateTo.includes("T")
          ? filters.dateTo
          : `${filters.dateTo}T23:59:59.999Z`;
        query = query.lte("created_at", end);
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        console.error("Error fetching all questions:", error);
        throw error;
      }

      const questions: QuestionWithDetails[] = (data || []).map((row) => {
        const product = row.products
          ? {
              product_id: row.products.product_id,
              title: row.products.title,
              image: row.products.image,
              category_id: row.products.category_id,
              category: row.products.categories ?? null,
            }
          : undefined;

        return {
          id: row.id,
          product_id: row.product_id,
          user_id: row.user_id ?? null,
          name: row.name,
          email: row.email,
          question: row.question,
          status: row.status as QuestionStatus,
          created_at: row.created_at ?? undefined,
          updated_at: row.updated_at ?? undefined,
          product,
        };
      });

      return {
        questions,
        total: count || 0,
      };
    } catch (err) {
      console.error("Failed to get all questions:", err);
      throw err;
    }
  },

  async updateQuestionStatus(
    questionId: number,
    status: QuestionStatus,
  ): Promise<void> {
    const { error } = await supabase
      .from("questions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", questionId);

    if (error) {
      console.error("Error updating question status:", error);
      throw error;
    }
  },

  async deleteQuestion(questionId: number): Promise<void> {
    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", questionId);

    if (error) {
      console.error("Error deleting question:", error);
      throw error;
    }
  },
};
