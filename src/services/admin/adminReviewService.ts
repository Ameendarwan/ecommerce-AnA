import { supabase } from "@/lib/supabase/client";
import { ReviewType } from "@/types";

export interface ReviewWithDetails extends ReviewType {
  profile?: {
    username?: string;
    email?: string;
    avatar_url?: string;
  };
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

export interface ReviewFilters {
  categoryId?: number;
  productId?: string;
  rating?: number;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Admin service for review management
 */
export const adminReviewService = {
  async getAllReviews(
    filters: ReviewFilters = {},
    page: number = 1,
    limit: number = 50,
  ): Promise<{ reviews: ReviewWithDetails[]; total: number }> {
    try {
      const needsProductInner = Boolean(filters.categoryId);

      const productsJoin = needsProductInner
        ? "products!reviews_product_id_fkey!inner"
        : "products!reviews_product_id_fkey";

      let query = supabase.from("reviews").select(
        `
					*,
					profiles!reviews_user_id_fkey (
						username,
						email,
						avatar_url
					),
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
      if (filters.rating) {
        query = query.eq("rating", filters.rating);
      }
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        // Inclusive end-of-day when only a date string is provided
        const end = filters.dateTo.includes("T")
          ? filters.dateTo
          : `${filters.dateTo}T23:59:59.999Z`;
        query = query.lte("created_at", end);
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        console.error("Error fetching all reviews:", error);
        throw error;
      }

      const reviews: ReviewWithDetails[] = (data || []).map((review) => {
        const product = review.products
          ? {
              product_id: review.products.product_id,
              title: review.products.title,
              image: review.products.image,
              category_id: review.products.category_id,
              category: review.products.categories ?? null,
            }
          : undefined;

        return {
          id: review.id,
          product_id: review.product_id,
          user_id: review.user_id,
          rating: review.rating,
          comment: review.comment ?? undefined,
          created_at: review.created_at ?? undefined,
          profile: review.profiles ?? undefined,
          product,
        };
      });

      return {
        reviews,
        total: count || 0,
      };
    } catch (err) {
      console.error("Failed to get all reviews:", err);
      throw err;
    }
  },

  async deleteReview(reviewId: number): Promise<void> {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  },
};
