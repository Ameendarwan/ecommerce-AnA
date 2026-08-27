import { supabase } from "@/lib/supabase/client";
import { FaqItemType } from "@/types";

export interface FaqFilters {
  category?: string;
  published?: boolean;
}

export interface CreateFaqData {
  question: string;
  answer: string;
  category?: string;
  order_index?: number;
  is_published?: boolean;
}

export interface UpdateFaqData {
  question?: string;
  answer?: string;
  category?: string;
  order_index?: number;
  is_published?: boolean;
}

export const adminFaqService = {
  async getAllFaqs(
    filters: FaqFilters = {},
    page: number = 1,
    limit: number = 50,
  ): Promise<{ faqs: FaqItemType[]; total: number }> {
    try {
      let query = supabase.from("faqs").select("*", { count: "exact" });

      if (filters.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }
      if (filters.published !== undefined) {
        query = query.eq("is_published", filters.published);
      }

      const { data, error, count } = await query
        .order("order_index", { ascending: true })
        .order("id", { ascending: true })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        console.error("Error fetching FAQs:", error);
        throw error;
      }

      return {
        faqs: (data || []) as FaqItemType[],
        total: count || 0,
      };
    } catch (err) {
      console.error("Failed to get all FAQs:", err);
      throw err;
    }
  },

  async getFaqById(id: number): Promise<FaqItemType | null> {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching FAQ by id:", error);
      throw error;
    }

    return data as FaqItemType;
  },

  async createFaq(data: CreateFaqData): Promise<FaqItemType> {
    const { data: created, error } = await supabase
      .from("faqs")
      .insert({
        question: data.question.trim(),
        answer: data.answer.trim(),
        category: data.category?.trim() || "General",
        order_index: data.order_index ?? 0,
        is_published: data.is_published ?? true,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating FAQ:", error);
      throw error;
    }

    return created as FaqItemType;
  },

  async updateFaq(id: number, data: UpdateFaqData): Promise<FaqItemType> {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.question !== undefined) updatePayload.question = data.question.trim();
    if (data.answer !== undefined) updatePayload.answer = data.answer.trim();
    if (data.category !== undefined) updatePayload.category = data.category.trim() || "General";
    if (data.order_index !== undefined) updatePayload.order_index = data.order_index;
    if (data.is_published !== undefined) updatePayload.is_published = data.is_published;

    const { data: updated, error } = await supabase
      .from("faqs")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating FAQ:", error);
      throw error;
    }

    return updated as FaqItemType;
  },

  async toggleFaqPublished(id: number, is_published: boolean): Promise<void> {
    const { error } = await supabase
      .from("faqs")
      .update({ is_published, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error toggling FAQ status:", error);
      throw error;
    }
  },

  async deleteFaq(id: number): Promise<void> {
    const { error } = await supabase.from("faqs").delete().eq("id", id);

    if (error) {
      console.error("Error deleting FAQ:", error);
      throw error;
    }
  },
};
