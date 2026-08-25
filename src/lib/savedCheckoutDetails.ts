export interface SavedCheckoutDetails {
  guestName: string;
  guestPhone: string;
  street: string;
  city: string;
  notes: string;
}

const STORAGE_KEY = "ecommerce-saved-checkout-details";

export function getSavedCheckoutDetails(): SavedCheckoutDetails | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<SavedCheckoutDetails>;
    if (
      typeof parsed.guestName !== "string" ||
      typeof parsed.guestPhone !== "string" ||
      typeof parsed.street !== "string" ||
      typeof parsed.city !== "string"
    ) {
      return null;
    }
    return {
      guestName: parsed.guestName,
      guestPhone: parsed.guestPhone,
      street: parsed.street,
      city: parsed.city,
      notes: typeof parsed.notes === "string" ? parsed.notes : "",
    };
  } catch {
    return null;
  }
}

export function saveCheckoutDetails(details: SavedCheckoutDetails): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
}

export function clearSavedCheckoutDetails(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
