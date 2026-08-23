'use server';

import { createServiceRoleSupabase } from '@/lib/supabase/serviceRole';
import { SHIPPING_PKR } from '@/lib/shipping';
import { isMockMode } from '@/lib/mockMode';

export interface CodCartLine {
  product_id: string;
  quantity: number;
  price: number;
  title: string;
}

export interface CodCheckoutPayload {
  guestName: string;
  guestPhone: string;
  street: string;
  city: string;
  notes?: string;
  items: CodCartLine[];
}

export type PlaceCodOrderResult =
  | { ok: true; orderId: number; total: number }
  | { ok: false; error: string };

function normalizePkPhone(phone: string): string {
  return phone.replace(/[\s-]/g, '');
}

function isValidPkPhone(phone: string): boolean {
  const normalized = normalizePkPhone(phone);
  return /^(\+92|0)?3\d{9}$/.test(normalized);
}

export async function placeCodOrder(
  payload: CodCheckoutPayload
): Promise<PlaceCodOrderResult> {
  const guestName = payload.guestName?.trim();
  const guestPhone = payload.guestPhone?.trim();
  const street = payload.street?.trim();
  const city = payload.city?.trim();
  const notes = payload.notes?.trim() || null;
  const items = payload.items ?? [];

  if (!guestName || guestName.length < 2) {
    return { ok: false, error: 'Please enter your full name' };
  }
  if (!guestPhone || !isValidPkPhone(guestPhone)) {
    return {
      ok: false,
      error: 'Enter a valid Pakistan mobile number (e.g. 03XXXXXXXXX)',
    };
  }
  if (!street || street.length < 5) {
    return { ok: false, error: 'Please enter a complete delivery address' };
  }
  if (!city || city.length < 2) {
    return { ok: false, error: 'Please enter your city' };
  }
  if (!items.length) {
    return { ok: false, error: 'Your cart is empty' };
  }

  for (const item of items) {
    if (!item.product_id || item.quantity < 1 || item.price < 0) {
      return { ok: false, error: 'Invalid cart items' };
    }
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal + SHIPPING_PKR;

  // Mock / offline-dev: accept order without DB when service role missing
  if (isMockMode() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const mockId = Math.floor(Date.now() % 100000);
    return { ok: true, orderId: mockId, total };
  }

  try {
    const supabase = createServiceRoleSupabase();

    for (const item of items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('product_id, stock, price, title')
        .eq('product_id', item.product_id)
        .single();

      if (error || !product) {
        return {
          ok: false,
          error: `Product unavailable: ${item.title || item.product_id}`,
        };
      }
      if (product.stock < item.quantity) {
        return {
          ok: false,
          error:
            product.stock <= 0
              ? `${product.title} is sold out`
              : `Only ${product.stock} left of ${product.title}`,
        };
      }
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: null,
        status: 'pending',
        total,
        payment_method: 'cod',
        guest_name: guestName,
        guest_phone: normalizePkPhone(guestPhone),
        shipping_street: street,
        shipping_city: city,
        shipping_notes: notes,
        shipping_fee: SHIPPING_PKR,
      } as Record<string, unknown>)
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('COD order insert failed:', orderError);
      return {
        ok: false,
        error:
          orderError?.message ||
          'Could not place order. Ensure guest COD migration is applied.',
      };
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('COD order items failed:', itemsError);
      await supabase.from('orders').delete().eq('id', order.id);
      return { ok: false, error: 'Could not save order items' };
    }

    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('product_id', item.product_id)
        .single();

      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('product_id', item.product_id);
      }
    }

    return { ok: true, orderId: order.id, total };
  } catch (err) {
    console.error('placeCodOrder error:', err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unexpected error placing order',
    };
  }
}
