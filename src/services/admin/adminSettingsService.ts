import { supabase } from "@/lib/supabase/client";
import { mergeStoreSettings } from "@/lib/storeSettingsDefaults";
import { StoreSettingsType } from "@/types";

export interface UpdateStoreSettingsData {
  shipping_price?: number;
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
  social_tiktok?: string;
  social_youtube?: string;
  social_facebook?: string;
  social_instagram?: string;
  show_theme_toggle?: boolean;
}

export const adminSettingsService = {
  async getSettings(): Promise<StoreSettingsType> {
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching store settings:", error);
      throw error;
    }

    return mergeStoreSettings(data as Partial<StoreSettingsType> | null);
  },

  async updateSettings(
    settingsData: UpdateStoreSettingsData,
  ): Promise<StoreSettingsType> {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (settingsData.shipping_price !== undefined) {
      payload.shipping_price = settingsData.shipping_price;
    }
    if (settingsData.phone !== undefined) {
      payload.phone = settingsData.phone.trim();
    }
    if (settingsData.email !== undefined) {
      payload.email = settingsData.email.trim();
    }
    if (settingsData.address !== undefined) {
      payload.address = settingsData.address.trim();
    }
    if (settingsData.hours !== undefined) {
      payload.hours = settingsData.hours.trim();
    }
    if (settingsData.social_tiktok !== undefined) {
      payload.social_tiktok = settingsData.social_tiktok.trim();
    }
    if (settingsData.social_youtube !== undefined) {
      payload.social_youtube = settingsData.social_youtube.trim();
    }
    if (settingsData.social_facebook !== undefined) {
      payload.social_facebook = settingsData.social_facebook.trim();
    }
    if (settingsData.social_instagram !== undefined) {
      payload.social_instagram = settingsData.social_instagram.trim();
    }
    if (settingsData.show_theme_toggle !== undefined) {
      payload.show_theme_toggle = settingsData.show_theme_toggle;
    }

    const { data, error } = await supabase
      .from("store_settings")
      .upsert({ id: 1, ...payload }, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("Error updating store settings:", error);
      throw error;
    }

    return mergeStoreSettings(data as Partial<StoreSettingsType>);
  },
};
