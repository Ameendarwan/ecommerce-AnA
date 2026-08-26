import { supabase } from "@/lib/supabase/client";
import { ProductBadge, ProductType } from "@/types";

export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  image?: string;
  images?: string[];
  stock: number;
  sku?: string;
  category_id?: number;
  is_visible?: boolean;
  show_sale_tag?: boolean;
  show_badge?: boolean;
  discount_percent?: number;
  badge?: ProductBadge;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  updated_at?: string;
}

export interface ProductWithDetails extends ProductType {
  category?: {
    id: number;
    name: string;
  };
  total_reviews?: number;
  average_rating?: number;
}

export interface ProductFilters {
  categoryId?: number;
  isVisible?: boolean;
  lowStock?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

const LOW_STOCK_THRESHOLD = 5;

/**
 * Admin service for product management
 * Requires admin privileges for all operations
 */
export const adminProductService = {
  /**
   * Get products with filters, pagination, and review stats for admin view
   */
  async getAllProducts(
    filters: ProductFilters = {},
    page: number = 1,
    limit: number = 50,
  ): Promise<{ products: ProductWithDetails[]; total: number }> {
    try {
      let query = supabase.from("products").select(
        `
					*,
					categories!products_category_id_fkey (
						id,
						name
					)
				`,
        { count: "exact" },
      );

      if (filters.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }
      if (filters.isVisible !== undefined) {
        query = query.eq("is_visible", filters.isVisible);
      }
      if (filters.lowStock) {
        query = query.lte("stock", LOW_STOCK_THRESHOLD);
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
        console.error("Error fetching all products:", error);
        throw error;
      }

      const productIds = (data || []).map((p) => p.product_id);
      const reviewStatsByProduct = new Map<
        string,
        { total: number; average: number }
      >();

      if (productIds.length > 0) {
        const { data: reviewRows } = await supabase
          .from("reviews")
          .select("product_id, rating")
          .in("product_id", productIds);

        const buckets = new Map<string, number[]>();
        for (const row of reviewRows || []) {
          const list = buckets.get(row.product_id) || [];
          list.push(row.rating);
          buckets.set(row.product_id, list);
        }

        for (const [productId, ratings] of buckets) {
          const total = ratings.length;
          const average =
            total > 0
              ? ratings.reduce((sum, rating) => sum + rating, 0) / total
              : 0;
          reviewStatsByProduct.set(productId, {
            total,
            average: Number(average.toFixed(1)),
          });
        }
      }

      const products: ProductWithDetails[] = (data || []).map((product) => {
        const stats = reviewStatsByProduct.get(product.product_id);
        return {
          ...product,
          category: product.categories ?? undefined,
          total_reviews: stats?.total ?? 0,
          average_rating: stats?.average ?? 0,
        };
      });

      return {
        products,
        total: count || 0,
      };
    } catch (err) {
      console.error("Failed to get all products:", err);
      throw err;
    }
  },

  /**
   * Create a new product
   */
  async createProduct(productData: CreateProductData): Promise<ProductType> {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert({
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating product:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to create product:", err);
      throw err;
    }
  },

  /**
   * Update an existing product
   */
  async updateProduct(
    productId: string,
    productData: UpdateProductData,
  ): Promise<ProductType> {
    try {
      const { data, error } = await supabase
        .from("products")
        .update({
          ...productData,
          updated_at: new Date().toISOString(),
        })
        .eq("product_id", productId)
        .select()
        .single();

      if (error) {
        console.error("Error updating product:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to update product:", err);
      throw err;
    }
  },

  /**
   * Delete a product
   */
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("product_id", productId);

      if (error) {
        console.error("Error deleting product:", error);
        throw error;
      }

      return true;
    } catch (err) {
      console.error("Failed to delete product:", err);
      throw err;
    }
  },

  /**
   * Update product stock
   */
  async updateStock(productId: string, newStock: number): Promise<ProductType> {
    try {
      const { data, error } = await supabase
        .from("products")
        .update({
          stock: newStock,
          updated_at: new Date().toISOString(),
        })
        .eq("product_id", productId)
        .select()
        .single();

      if (error) {
        console.error("Error updating product stock:", error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Failed to update product stock:", err);
      throw err;
    }
  },

  /**
   * Get products with low stock (below threshold)
   */
  async getLowStockProducts(threshold: number = 10): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .lt("stock", threshold)
        .order("stock", { ascending: true });

      if (error) {
        console.error("Error fetching low stock products:", error);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error("Failed to get low stock products:", err);
      return [];
    }
  },

  /**
   * Get product analytics data
   */
  async getProductAnalytics() {
    try {
      // Get total products count
      const { count: totalProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // Get products by category
      const { data: categoryCounts } = await supabase.from("products").select(`
					category_id,
					categories!products_category_id_fkey (
						name
					)
				`);

      // Count products by category
      const categoryStats = (categoryCounts || []).reduce<
        Record<string, number>
      >((acc, product) => {
        const categoryName = (() => {
          const cat = (product as { categories?: unknown }).categories;
          if (Array.isArray(cat)) {
            return (cat[0] as { name?: string }).name ?? "Uncategorized";
          }
          return (cat as { name?: string } | null)?.name ?? "Uncategorized";
        })();

        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
      }, {});

      // Get low stock count
      const { count: lowStockCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .lt("stock", 10);

      // Get total inventory value
      const { data: products } = await supabase
        .from("products")
        .select("price, stock");

      const totalInventoryValue = (products || []).reduce(
        (sum, product) => sum + product.price * product.stock,
        0,
      );

      return {
        totalProducts: totalProducts || 0,
        categoryStats,
        lowStockCount: lowStockCount || 0,
        totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      };
    } catch (err) {
      console.error("Failed to get product analytics:", err);
      return {
        totalProducts: 0,
        categoryStats: {},
        lowStockCount: 0,
        totalInventoryValue: 0,
      };
    }
  },

  /**
   * Bulk update products
   */
  async bulkUpdateProducts(
    updates: Array<{ productId: string; data: UpdateProductData }>,
  ): Promise<boolean> {
    try {
      const promises = updates.map(({ productId, data }) =>
        this.updateProduct(productId, data),
      );

      await Promise.all(promises);
      return true;
    } catch (err) {
      console.error("Failed to bulk update products:", err);
      throw err;
    }
  },
};
