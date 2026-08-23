/**
 * Format a number as currency (PKR by default for Pakistan storefront)
 */
import { STORE_CURRENCY, STORE_LOCALE } from '@/lib/shipping';

export function formatCurrency(
  amount: number,
  currency: string = STORE_CURRENCY
): string {
  return new Intl.NumberFormat(STORE_LOCALE, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
