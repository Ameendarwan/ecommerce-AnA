import { createPublicSupabase } from "@/lib/supabase/server";
import { FaqItemType } from "@/types";

export const faqService = {
  async getPublishedFaqs(): Promise<FaqItemType[]> {
    try {
      const supabase = createPublicSupabase();
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("is_published", true)
        .order("order_index", { ascending: true })
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching published FAQs:", error);
        return [];
      }

      return (data || []) as FaqItemType[];
    } catch (err) {
      console.error("Exception fetching published FAQs:", err);
      return [];
    }
  },
};
