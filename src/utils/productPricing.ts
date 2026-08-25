import { ProductType } from "@/types";

/** Clamp discount to a valid 0–100 integer. */
export function normalizeDiscountPercent(
  value: number | null | undefined,
): number {
  if (value == null || Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/** Sale price after discount. `price` is treated as the original list price. */
export function getSalePrice(
  price: number,
  discountPercent?: number | null,
): number {
  const discount = normalizeDiscountPercent(discountPercent);
  if (discount <= 0) return price;
  return Math.round(price * (1 - discount / 100));
}

export function hasActiveDiscount(
  discountPercent?: number | null,
): boolean {
  return normalizeDiscountPercent(discountPercent) > 0;
}

export function getProductSalePrice(product: Pick<ProductType, "price" | "discount_percent">): number {
  return getSalePrice(product.price, product.discount_percent);
}
