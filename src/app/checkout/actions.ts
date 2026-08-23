'use server';

/**
 * Polar payments are disabled — storefront uses Cash on Delivery only.
 * Kept as stubs so any leftover imports fail clearly.
 */

export async function createPolarCheckout(): Promise<never> {
  throw new Error(
    'Online payment is disabled. Use Cash on Delivery checkout at /checkout.'
  );
}

export async function createCheckoutSession(): Promise<never> {
  throw new Error(
    'Online payment is disabled. Use Cash on Delivery checkout at /checkout.'
  );
}
