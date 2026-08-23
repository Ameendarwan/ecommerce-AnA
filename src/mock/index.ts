import { CategoryType } from '@/types';
import { mockCategories } from './categories';
import { mockProducts, ProductWithCategory } from './products';
import { mockReviews, ReviewWithProfile } from './reviews';

export { mockCategories, mockProducts, mockReviews };
export type { ProductWithCategory, ReviewWithProfile };

export function getMockProducts(): ProductWithCategory[] {
  return [...mockProducts].sort((a, b) => a.title.localeCompare(b.title));
}

export function getMockProductById(id: string): ProductWithCategory | null {
  return mockProducts.find((product) => product.product_id === id) ?? null;
}

export function getMockProductsByCategory(
  categoryId: number
): ProductWithCategory[] {
  return getMockProducts().filter(
    (product) => product.category_id === categoryId
  );
}

export function searchMockProducts(query: string): ProductWithCategory[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return getMockProducts();

  return getMockProducts().filter(
    (product) =>
      product.title.toLowerCase().includes(normalized) ||
      product.description.toLowerCase().includes(normalized)
  );
}

export function getMockCategories(): CategoryType[] {
  return [...mockCategories].sort((a, b) => a.name.localeCompare(b.name));
}

export function getMockCategoryById(id: number): CategoryType | null {
  return mockCategories.find((category) => category.id === id) ?? null;
}

export function getMockReviewsByProduct(
  productId: string
): ReviewWithProfile[] {
  return mockReviews
    .filter((review) => review.product_id === productId)
    .sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime()
    );
}

export function getMockReviewById(id: number): ReviewWithProfile | null {
  return mockReviews.find((review) => review.id === id) ?? null;
}

export interface MockCartItem {
  product_id: string;
  quantity: number;
}

const LOCAL_CART_KEY = 'ecommerce-mock-cart';

export function getMockLocalCart(): MockCartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(LOCAL_CART_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as MockCartItem[];
  } catch {
    return [];
  }
}

export function saveMockLocalCart(items: MockCartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}
