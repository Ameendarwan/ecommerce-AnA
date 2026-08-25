import { supabase } from "@/lib/supabase/client";
import {
  DEFAULT_STORE_SETTINGS,
  mergeStoreSettings,
} from "@/lib/storeSettingsDefaults";
import { StoreSettingsType } from "@/types";

export const storeSettingsService = {
  async getSettings(): Promise<StoreSettingsType> {
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching store settings:", error);
      return DEFAULT_STORE_SETTINGS;
    }

    return mergeStoreSettings(data as Partial<StoreSettingsType> | null);
  },
};
