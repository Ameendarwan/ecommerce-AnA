import { StoreSettingsType } from "@/types";

/** Fallback values when DB settings are unavailable. */
export const DEFAULT_STORE_SETTINGS: StoreSettingsType = {
  id: 1,
  shipping_price: 250,
  phone: "0310-0021434",
  email: "admin@thriftonia.pk",
  address: "",
  hours: "Mon–Sat: 02:00 PM to 09:00 PM",
  social_tiktok: "https://www.tiktok.com/@thriftonia",
  social_youtube: "https://www.youtube.com/@thriftonia",
  social_facebook: "https://www.facebook.com/thriftonia",
  social_instagram: "https://www.instagram.com/thriftonia",
};

export function mergeStoreSettings(
  row: Partial<StoreSettingsType> | null | undefined,
): StoreSettingsType {
  if (!row) return DEFAULT_STORE_SETTINGS;

  return {
    id: row.id ?? DEFAULT_STORE_SETTINGS.id,
    shipping_price: row.shipping_price ?? DEFAULT_STORE_SETTINGS.shipping_price,
    phone: row.phone ?? DEFAULT_STORE_SETTINGS.phone,
    email: row.email ?? DEFAULT_STORE_SETTINGS.email,
    address: row.address ?? DEFAULT_STORE_SETTINGS.address,
    hours: row.hours ?? DEFAULT_STORE_SETTINGS.hours,
    social_tiktok: row.social_tiktok ?? DEFAULT_STORE_SETTINGS.social_tiktok,
    social_youtube: row.social_youtube ?? DEFAULT_STORE_SETTINGS.social_youtube,
    social_facebook:
      row.social_facebook ?? DEFAULT_STORE_SETTINGS.social_facebook,
    social_instagram:
      row.social_instagram ?? DEFAULT_STORE_SETTINGS.social_instagram,
    updated_at: row.updated_at,
  };
}

/** Contact/social shape used across Footer and content pages. */
export function toStoreContact(settings: StoreSettingsType) {
  return {
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    hours: settings.hours,
    shippingPrice: settings.shipping_price,
    socials: {
      tiktok: settings.social_tiktok,
      youtube: settings.social_youtube,
      facebook: settings.social_facebook,
      instagram: settings.social_instagram,
    },
  };
}
