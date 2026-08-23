import { CategoryType, ProductType } from '@/types';
import { mockCategories } from './categories';

export type ProductWithCategory = ProductType & { category?: CategoryType };

const categoryById = Object.fromEntries(
  mockCategories.map((category) => [category.id, category])
);

const now = '2025-01-15T10:00:00.000Z';

export const mockProducts: ProductWithCategory[] = [
  {
    product_id: '22222222-2222-4222-8222-222222222201',
    title: 'Used Cotton Shirt — Soft Blue',
    description:
      'Gently worn cotton shirt in soft blue. Single piece, size Medium. Light wear on collar.',
    price: 1800,
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
    stock: 1,
    sku: 'USED-SHIRT-001',
    category_id: 1,
    created_at: now,
    updated_at: now,
    category: categoryById[1],
  },
  {
    product_id: '22222222-2222-4222-8222-222222222202',
    title: 'Pre-loved Denim Shirt',
    description:
      'Classic denim shirt, size Large. One of a kind — washed and ready to wear.',
    price: 2200,
    image:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop',
    stock: 1,
    sku: 'USED-SHIRT-002',
    category_id: 1,
    created_at: now,
    updated_at: now,
    category: categoryById[1],
  },
  {
    product_id: '22222222-2222-4222-8222-222222222203',
    title: 'Checked Casual Shirt',
    description:
      'Casual checked shirt, size Small. Minor fading, still in good shape.',
    price: 1500,
    image:
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&h=600&fit=crop',
    stock: 1,
    sku: 'USED-SHIRT-003',
    category_id: 1,
    created_at: now,
    updated_at: now,
    category: categoryById[1],
  },
  {
    product_id: '33333333-3333-4333-8333-333333333301',
    title: 'Used Crossbody Bag',
    description:
      'Compact crossbody bag with adjustable strap. Light scuffs on base. One available.',
    price: 2800,
    image:
      'https://images.unsplash.com/photo-1548036328-c9fa89d12836?w=600&h=600&fit=crop',
    stock: 1,
    sku: 'USED-BAG-001',
    category_id: 2,
    created_at: now,
    updated_at: now,
    category: categoryById[2],
  },
  {
    product_id: '33333333-3333-4333-8333-333333333302',
    title: 'Pre-loved Tote Bag',
    description:
      'Spacious canvas tote. Clean interior, sturdy handles. Unique piece.',
    price: 1200,
    image:
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop',
    stock: 1,
    sku: 'USED-BAG-002',
    category_id: 2,
    created_at: now,
    updated_at: now,
    category: categoryById[2],
  },
  {
    product_id: '33333333-3333-4333-8333-333333333303',
    title: 'Leather Shoulder Bag',
    description:
      'Genuine leather shoulder bag with natural patina. One of a kind.',
    price: 4500,
    image:
      'https://images.unsplash.com/photo-1548036328-c9fa89d12836?w=600&h=600&fit=crop',
    stock: 1,
    sku: 'USED-BAG-003',
    category_id: 2,
    created_at: now,
    updated_at: now,
    category: categoryById[2],
  },
  {
    product_id: '44444444-4444-4444-8444-444444444401',
    title: 'Used Sneakers — Size 42',
    description:
      'White sneakers, EU 42. Cleaned soles, light crease on toe box. Single pair.',
    price: 3500,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    stock: 1,
    sku: 'USED-SHOE-001',
    category_id: 3,
    created_at: now,
    updated_at: now,
    category: categoryById[3],
  },
  {
    product_id: '44444444-4444-4444-8444-444444444402',
    title: 'Pre-loved Formal Shoes — Size 41',
    description:
      'Black formal shoes, EU 41. Polished, slight wear on heel. One pair only.',
    price: 4000,
    image:
      'https://images.unsplash.com/photo-1614252231339-9109dafce7d4?w=600&h=600&fit=crop',
    stock: 1,
    sku: 'USED-SHOE-002',
    category_id: 3,
    created_at: now,
    updated_at: now,
    category: categoryById[3],
  },
  {
    product_id: '44444444-4444-4444-8444-444444444403',
    title: 'Casual Loafers — Size 43',
    description:
      'Brown loafers, EU 43. Comfortable used pair in good condition.',
    price: 3200,
    image:
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&h=600&fit=crop',
    stock: 1,
    sku: 'USED-SHOE-003',
    category_id: 3,
    created_at: now,
    updated_at: now,
    category: categoryById[3],
  },
];
