import { createPublicSupabase } from "@/lib/supabase/server";
import { PageType } from "@/types";

export const pageService = {
  async getPageBySlug(slug: string): Promise<PageType | null> {
    try {
      const supabase = createPublicSupabase();
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) {
        console.error(`Error fetching page with slug ${slug}:`, error);
        return null;
      }

      return data as PageType | null;
    } catch (err) {
      console.error(`Exception fetching page with slug ${slug}:`, err);
      return null;
    }
  },

  async getAllPublishedPages(): Promise<PageType[]> {
    try {
      const supabase = createPublicSupabase();
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("is_published", true)
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching published pages:", error);
        return [];
      }

      return (data || []) as PageType[];
    } catch (err) {
      console.error("Exception fetching published pages:", err);
      return [];
    }
  },
};
