'use server';

import { createServiceRoleSupabase } from '@/lib/supabase/serviceRole';
import { getStoreSettingsServer } from '@/services/settings/getStoreSettingsServer';
import { DEFAULT_STORE_SETTINGS } from '@/lib/storeSettingsDefaults';
import { revalidateCatalog } from '@/lib/cache/revalidateCatalog';

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

export type CodOrderSummaryItem = {
  product_id: string;
  title: string;
  quantity: number;
  price: number;
  image: string | null;
};

export type CodOrderSummary = {
  orderId: number;
  total: number;
  shippingFee: number;
  guestName: string | null;
  shippingCity: string | null;
  items: CodOrderSummaryItem[];
};

type ServiceSupabase = ReturnType<typeof createServiceRoleSupabase>;

function normalizePkPhone(phone: string): string {
  return phone.replace(/[\s-]/g, '');
}

function isValidPkPhone(phone: string): boolean {
  const normalized = normalizePkPhone(phone);
  return /^(\+92|0)?3\d{9}$/.test(normalized);
}

function isValidOrderQuantity(quantity: unknown): quantity is number {
  return (
    typeof quantity === 'number' &&
    Number.isInteger(quantity) &&
    quantity >= 1
  );
}

async function restoreReservedStock(
  supabase: ServiceSupabase,
  reserved: Array<{ product_id: string; quantity: number }>
) {
  for (const item of reserved) {
    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('product_id', item.product_id)
      .single();

    if (product) {
      await supabase
        .from('products')
        .update({ stock: product.stock + item.quantity })
        .eq('product_id', item.product_id);
    }
  }
}

/**
 * Reserve stock with optimistic locking:
 * only succeeds if stock is still the expected value and >= quantity.
 */
async function reserveStock(
  supabase: ServiceSupabase,
  productId: string,
  expectedStock: number,
  quantity: number
): Promise<boolean> {
  const { data, error } = await supabase
    .from('products')
    .update({ stock: expectedStock - quantity })
    .eq('product_id', productId)
    .eq('stock', expectedStock)
    .gte('stock', quantity)
    .select('product_id')
    .maybeSingle();

  return !error && !!data;
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
    if (!item.product_id || item.price < 0) {
      return { ok: false, error: 'Invalid cart items' };
    }
    if (!isValidOrderQuantity(item.quantity)) {
      return {
        ok: false,
        error: `Invalid quantity for ${item.title || 'a product'} — quantity must be at least 1`,
      };
    }
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const storeSettings = await getStoreSettingsServer();
  const shippingFee =
    storeSettings.shipping_price ?? DEFAULT_STORE_SETTINGS.shipping_price;
  const total = subtotal + shippingFee;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: 'Order service is not configured' };
  }

  const reserved: Array<{ product_id: string; quantity: number }> = [];

  try {
    const supabase = createServiceRoleSupabase();

    // Validate quantity/stock and reserve before creating the order (race-safe)
    for (const item of items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('product_id, stock, title')
        .eq('product_id', item.product_id)
        .single();

      if (error || !product) {
        await restoreReservedStock(supabase, reserved);
        return {
          ok: false,
          error: `Product unavailable: ${item.title || item.product_id}`,
        };
      }

      if (!product.stock || product.stock < 1) {
        await restoreReservedStock(supabase, reserved);
        return { ok: false, error: `${product.title} is sold out` };
      }

      if (product.stock < item.quantity) {
        await restoreReservedStock(supabase, reserved);
        return {
          ok: false,
          error: `Only ${product.stock} left of ${product.title}`,
        };
      }

      const reservedOk = await reserveStock(
        supabase,
        item.product_id,
        product.stock,
        item.quantity
      );

      if (!reservedOk) {
        await restoreReservedStock(supabase, reserved);
        return {
          ok: false,
          error: `${product.title} just sold out — please update your cart`,
        };
      }

      reserved.push({ product_id: item.product_id, quantity: item.quantity });
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
        shipping_fee: shippingFee,
      } as Record<string, unknown>)
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('COD order insert failed:', orderError);
      await restoreReservedStock(supabase, reserved);
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
      await restoreReservedStock(supabase, reserved);
      return { ok: false, error: 'Could not save order items' };
    }

    await revalidateCatalog(items.map((item) => item.product_id));

    return { ok: true, orderId: order.id, total };
  } catch (err) {
    console.error('placeCodOrder error:', err);
    try {
      if (reserved.length && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        await restoreReservedStock(createServiceRoleSupabase(), reserved);
      }
    } catch (restoreErr) {
      console.error('Failed to restore stock after order error:', restoreErr);
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unexpected error placing order',
    };
  }
}

/** Receipt data for the post-checkout success page (service role; guest-safe fields only). */
export async function getCodOrderSummary(
  orderId: number
): Promise<CodOrderSummary | null> {
  if (!Number.isFinite(orderId) || orderId < 1) return null;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  try {
    const supabase = createServiceRoleSupabase();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(
        'id, total, shipping_fee, guest_name, shipping_city, payment_method, created_at'
      )
      .eq('id', orderId)
      .single();

    if (orderError || !order) return null;
    if (order.payment_method !== 'cod') return null;

    // Limit ID guessing: only show recent orders on the success page
    if (order.created_at) {
      const ageMs = Date.now() - new Date(order.created_at).getTime();
      if (ageMs > 24 * 60 * 60 * 1000) return null;
    }

    const { data: rows, error: itemsError } = await supabase
      .from('order_items')
      .select(
        `
        product_id,
        quantity,
        price,
        product:products ( title, image )
      `
      )
      .eq('order_id', orderId);

    if (itemsError || !rows) return null;

    const items: CodOrderSummaryItem[] = rows.map((row) => {
      const product = Array.isArray(row.product) ? row.product[0] : row.product;
      return {
        product_id: row.product_id,
        title: product?.title ?? 'Product',
        quantity: row.quantity,
        price: row.price,
        image: product?.image ?? null,
      };
    });

    return {
      orderId: order.id,
      total: order.total,
      shippingFee: order.shipping_fee ?? DEFAULT_STORE_SETTINGS.shipping_price,
      guestName: order.guest_name ?? null,
      shippingCity: order.shipping_city ?? null,
      items,
    };
  } catch (err) {
    console.error('getCodOrderSummary error:', err);
    return null;
  }
}
