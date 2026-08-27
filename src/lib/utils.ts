import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes a product UUID string by decoding URI components and handling
 * strings that may have spaces, missing hyphens, or uppercase letters.
 */
export function normalizeProductId(rawId: string | undefined | null): string {
  if (!rawId) return "";
  try {
    const decoded = decodeURIComponent(rawId).trim();
    const hexOnly = decoded.replace(/[^a-f0-9]/gi, "");
    if (hexOnly.length === 32) {
      return `${hexOnly.slice(0, 8)}-${hexOnly.slice(8, 12)}-${hexOnly.slice(12, 16)}-${hexOnly.slice(16, 20)}-${hexOnly.slice(20, 32)}`.toLowerCase();
    }
    return decoded.toLowerCase();
  } catch {
    return String(rawId).trim().toLowerCase();
  }
}

/**
 * Returns true if the string is a valid UUIDv4 format.
 */
export function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}
