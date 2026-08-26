export type ProductBadge = "new" | "used";

export interface ProductType {
  product_id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  images?: string[];
  stock: number;
  sku?: string;
  category_id?: number;
  is_visible?: boolean;
  show_sale_tag?: boolean;
  show_badge?: boolean;
  discount_percent?: number;
  badge?: ProductBadge;
  created_at?: string;
  updated_at?: string;
}

export interface CartItemType {
  id: number;
  cart_id: number;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
  product?: ProductType;
}

export type CartStatus = "active" | "abandoned" | "converted";

export interface CartType {
  id: number;
  user_id: string;
  status: CartStatus;
  created_at: string;
  updated_at: string;
  total_items: number;
  total_price: number;
  cart_items?: CartItemType[];
}

export interface OrderItemType {
  id: number;
  order_id: number;
  quantity: number;
  price: number;
  product_id: string;
  product?: {
    product_id: string;
    title: string;
    image?: string;
  };
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderType {
  id: number;
  user_id: string | null;
  status: OrderStatus;
  total: number;
  shipping_address_id?: number | null;
  payment_method?: string;
  payment_id?: string;
  guest_name?: string | null;
  guest_phone?: string | null;
  shipping_street?: string | null;
  shipping_city?: string | null;
  shipping_notes?: string | null;
  shipping_fee?: number | null;
  created_at?: string;
  updated_at?: string;
  order_items?: OrderItemType[];
}

export interface AddressType {
  id: number;
  user_id: string;
  street: string;
  city: string;
  state?: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

export interface ProfileType {
  profile_id: string;
  username?: string;
  avatar_url?: string;
  email?: string;
  role: "admin" | "user";
  created_at: string;
  updated_at?: string;
}

export interface ReviewType {
  id: number;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
}

export type QuestionStatus = "pending" | "answered" | "archived";

export interface QuestionType {
  id: number;
  product_id: string;
  user_id?: string | null;
  name: string;
  email: string;
  question: string;
  status: QuestionStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryType {
  id: number;
  name: string;
  description: string;
  parent_id?: number;
  is_visible?: boolean;
}

export interface StoreSettingsType {
  id: number;
  shipping_price: number;
  phone: string;
  email: string;
  address: string;
  hours: string;
  social_tiktok: string;
  social_youtube: string;
  social_facebook: string;
  social_instagram: string;
  updated_at?: string;
}
