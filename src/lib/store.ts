/** @deprecated Use storeSettingsDefaults / useStoreSettings instead. */
export {
  DEFAULT_STORE_SETTINGS,
  mergeStoreSettings,
  toStoreContact,
} from "@/lib/storeSettingsDefaults";

import { toStoreContact } from "@/lib/storeSettingsDefaults";
import { DEFAULT_STORE_SETTINGS } from "@/lib/storeSettingsDefaults";

/** Static fallback contact info — prefer DB settings via useStoreSettings. */
export const STORE = toStoreContact(DEFAULT_STORE_SETTINGS);
