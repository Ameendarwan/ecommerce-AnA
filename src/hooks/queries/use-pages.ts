import { supabase } from "@/lib/supabase/client";
import { PageType } from "@/types";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export const pagesKeys = {
  all: ["pages"] as const,
  published: () => [...pagesKeys.all, "published"] as const,
};

async function fetchPublishedPages(): Promise<PageType[]> {
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("is_published", true)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching published pages for footer:", error);
    throw error;
  }

  return (data || []) as PageType[];
}

export function usePublishedPages(
  options?: Omit<UseQueryOptions<PageType[]>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: pagesKeys.published(),
    queryFn: fetchPublishedPages,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: true,
    ...options,
  });
}
