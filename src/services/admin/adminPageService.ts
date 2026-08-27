import { supabase } from "@/lib/supabase/client";
import { PageType } from "@/types";

export interface PageFilters {
  published?: boolean;
}

export interface CreatePageData {
  title: string;
  slug: string;
  content: string;
  is_published?: boolean;
  seo_title?: string;
  seo_description?: string;
}

export interface UpdatePageData {
  title?: string;
  slug?: string;
  content?: string;
  is_published?: boolean;
  seo_title?: string;
  seo_description?: string;
}

export const adminPageService = {
  async getAllPages(
    filters: PageFilters = {},
    page: number = 1,
    limit: number = 50,
  ): Promise<{ pages: PageType[]; total: number }> {
    try {
      let query = supabase.from("pages").select("*", { count: "exact" });

      if (filters.published !== undefined) {
        query = query.eq("is_published", filters.published);
      }

      const { data, error, count } = await query
        .order("id", { ascending: true })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        console.error("Error fetching pages:", error);
        throw error;
      }

      return {
        pages: (data || []) as PageType[],
        total: count || 0,
      };
    } catch (err) {
      console.error("Failed to get all pages:", err);
      throw err;
    }
  },

  async getPageById(id: number): Promise<PageType | null> {
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching page by id:", error);
      throw error;
    }

    return data as PageType;
  },

  async createPage(data: CreatePageData): Promise<PageType> {
    const { data: created, error } = await supabase
      .from("pages")
      .insert({
        title: data.title.trim(),
        slug: data.slug.trim().toLowerCase(),
        content: data.content,
        is_published: data.is_published ?? true,
        seo_title: data.seo_title?.trim() || null,
        seo_description: data.seo_description?.trim() || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating page:", error);
      throw error;
    }

    return created as PageType;
  },

  async updatePage(id: number, data: UpdatePageData): Promise<PageType> {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.slug !== undefined) updatePayload.slug = data.slug.trim().toLowerCase();
    if (data.content !== undefined) updatePayload.content = data.content;
    if (data.is_published !== undefined) updatePayload.is_published = data.is_published;
    if (data.seo_title !== undefined) updatePayload.seo_title = data.seo_title.trim() || null;
    if (data.seo_description !== undefined) updatePayload.seo_description = data.seo_description.trim() || null;

    const { data: updated, error } = await supabase
      .from("pages")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating page:", error);
      throw error;
    }

    return updated as PageType;
  },

  async togglePagePublished(id: number, is_published: boolean): Promise<void> {
    const { error } = await supabase
      .from("pages")
      .update({ is_published, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error toggling page status:", error);
      throw error;
    }
  },

  async deletePage(id: number): Promise<void> {
    const { error } = await supabase.from("pages").delete().eq("id", id);

    if (error) {
      console.error("Error deleting page:", error);
      throw error;
    }
  },
};
