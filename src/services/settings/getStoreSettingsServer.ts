import { createPublicSupabase } from "@/lib/supabase/server";
import {
  DEFAULT_STORE_SETTINGS,
  mergeStoreSettings,
} from "@/lib/storeSettingsDefaults";
import { StoreSettingsType } from "@/types";

export async function getStoreSettingsServer(): Promise<StoreSettingsType> {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching store settings (server):", error);
      return DEFAULT_STORE_SETTINGS;
    }

    return mergeStoreSettings(data as Partial<StoreSettingsType> | null);
  } catch (error) {
    console.error("Error fetching store settings (server):", error);
    return DEFAULT_STORE_SETTINGS;
  }
}
