export interface LocalCartItem {
  product_id: string;
  quantity: number;
  /** Snapshot fields so cart works without re-fetching products */
  title: string;
  description: string;
  price: number;
  image?: string;
  stock: number;
  sku?: string;
  category_id?: number;
}

const LOCAL_CART_KEY = 'ecommerce-guest-cart';

export function getLocalCart(): LocalCartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(LOCAL_CART_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as LocalCartItem[];
  } catch {
    return [];
  }
}

export function saveLocalCart(items: LocalCartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}

export function clearLocalCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_CART_KEY);
}
