'use client';
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { ProductType } from '../types';
import { toast } from 'sonner';
import {
  clearLocalCart,
  getLocalCart,
  LocalCartItem,
  saveLocalCart,
} from '@/lib/localCart';
import { getProductSalePrice } from '@/utils/productPricing';

export interface CartItem extends ProductType {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: ProductType) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, amount: number) => void;
  clearCart: (options?: { silent?: boolean }) => void;
  totalItems: number;
  subtotal: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function toLocalItem(item: CartItem): LocalCartItem {
  return {
    product_id: item.product_id,
    quantity: item.quantity,
    title: item.title,
    description: item.description,
    price: item.price,
    image: item.image,
    stock: item.stock,
    sku: item.sku,
    category_id: item.category_id,
  };
}

function fromLocalItem(item: LocalCartItem): CartItem {
  return {
    product_id: item.product_id,
    title: item.title,
    description: item.description,
    price: item.price,
    image: item.image,
    stock: item.stock,
    sku: item.sku,
    category_id: item.category_id,
    quantity: item.quantity,
  };
}

function persist(items: CartItem[]) {
  saveLocalCart(items.map(toLocalItem));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getLocalCart().map(fromLocalItem);
    setCartItems(stored);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setSubtotal(
        cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
      );
      setTotalItems(cartItems.reduce((acc, item) => acc + item.quantity, 0));
    }
  }, [cartItems, isLoading]);

  const addToCart = (product: ProductType) => {
    if (product.stock <= 0) {
      toast.error('This item is sold out');
      return;
    }

    const existing = cartItems.find(
      (item) => item.product_id === product.product_id
    );

    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error(
          product.stock <= 1
            ? 'This unique item is already in your cart'
            : 'No more stock available'
        );
        return;
      }
      const updated = cartItems.map((item) =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + 1, stock: product.stock }
          : item
      );
      setCartItems(updated);
      persist(updated);
      toast.success('Updated cart');
      return;
    }

    const updated = [
      ...cartItems,
      {
        ...product,
        price: getProductSalePrice(product),
        quantity: 1,
      },
    ];
    setCartItems(updated);
    persist(updated);
    toast.success('Added to cart');
  };

  const removeFromCart = (productId: string) => {
    const updated = cartItems.filter((item) => item.product_id !== productId);
    setCartItems(updated);
    persist(updated);
    toast.success('Item removed from cart');
  };

  const updateQuantity = (productId: string, amount: number) => {
    const item = cartItems.find((i) => i.product_id === productId);
    if (!item) return;

    const newQuantity = item.quantity + amount;
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQuantity > item.stock) {
      toast.error('No more stock available');
      return;
    }

    const updated = cartItems.map((i) =>
      i.product_id === productId ? { ...i, quantity: newQuantity } : i
    );
    setCartItems(updated);
    persist(updated);
  };

  const clearCart = (options?: { silent?: boolean }) => {
    setCartItems([]);
    clearLocalCart();
    if (!options?.silent) {
      toast.success('Cart cleared');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
