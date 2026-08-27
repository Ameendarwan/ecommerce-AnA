import { createPublicSupabase } from "@/lib/supabase/server";
import { CategoryType } from "@/types";

export async function getCategoriesServer(): Promise<CategoryType[]> {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_visible", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories (server):", error);
      return [];
    }

    return (data || []) as CategoryType[];
  } catch (error) {
    console.error("Error fetching categories (server):", error);
    return [];
  }
}
