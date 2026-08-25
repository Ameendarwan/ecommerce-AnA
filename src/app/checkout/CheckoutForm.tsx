'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatCurrency';
import { STORE_COUNTRY } from '@/lib/shipping';
import {
  clearSavedCheckoutDetails,
  getSavedCheckoutDetails,
  saveCheckoutDetails,
} from '@/lib/savedCheckoutDetails';
import { placeCodOrder } from '@/app/checkout/placeCodOrder';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { productKeys } from '@/hooks/queries';
import { useStoreSettings } from '@/hooks/queries/use-store-settings';
import { DEFAULT_STORE_SETTINGS } from '@/lib/storeSettingsDefaults';

export default function CheckoutForm() {
  const { cartItems, subtotal, clearCart, isLoading } = useCart();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: settings } = useStoreSettings();
  const shippingPrice =
    settings?.shipping_price ?? DEFAULT_STORE_SETTINGS.shipping_price;
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [saveDetails, setSaveDetails] = useState(true);

  useEffect(() => {
    const saved = getSavedCheckoutDetails();
    if (saved) {
      setGuestName(saved.guestName);
      setGuestPhone(saved.guestPhone);
      setStreet(saved.street);
      setCity(saved.city);
      setNotes(saved.notes);
      setSaveDetails(true);
    }
  }, []);

  if (isLoading || redirecting) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 py-4">
        <LoadingSpinner />
        <p className="text-muted-foreground">
          {redirecting ? 'Confirming your order…' : 'Loading checkout…'}
        </p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="py-4 text-center">
        <h1 className="mb-4 text-2xl font-bold">Your cart is empty</h1>
        <Link href="/">
          <Button className="w-full sm:w-auto">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const total = subtotal + shippingPrice;

  const isValidPkPhone = (phone: string) => {
    const normalized = phone.replace(/[\s-]/g, '');
    return /^(\+92|0)?3\d{9}$/.test(normalized);
  };

  const isFormValid =
    guestName.trim().length >= 2 &&
    isValidPkPhone(guestPhone.trim()) &&
    city.trim().length >= 2 &&
    street.trim().length >= 5 &&
    cartItems.every(
      (item) =>
        Number.isInteger(item.quantity) &&
        item.quantity >= 1 &&
        item.stock >= 1 &&
        item.quantity <= item.stock
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const invalidItem = cartItems.find(
      (item) =>
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.stock < 1 ||
        item.quantity > item.stock
    );
    if (invalidItem) {
      toast.error(
        invalidItem.stock < 1 || invalidItem.quantity < 1
          ? `${invalidItem.title} has invalid quantity — remove it or update your cart`
          : `Only ${invalidItem.stock} left of ${invalidItem.title}`
      );
      return;
    }

    setSubmitting(true);

    try {
      const result = await placeCodOrder({
        guestName,
        guestPhone,
        street,
        city,
        notes,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          title: item.title,
        })),
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      if (saveDetails) {
        saveCheckoutDetails({
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
          street: street.trim(),
          city: city.trim(),
          notes: notes.trim(),
        });
      } else {
        clearSavedCheckoutDetails();
      }

      // Refresh product stock/availability on the storefront immediately
      await queryClient.invalidateQueries({ queryKey: productKeys.all });

      // Show loader before clearing cart so the empty-cart screen never flashes
      setRedirecting(true);
      clearCart({ silent: true });
      toast.success('Order placed — pay cash on delivery');
      router.push(
        `/checkout/success?order_id=${result.orderId}&total=${result.total}`
      );
      router.refresh();
      return;
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-4">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 md:grid-cols-5"
      >
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Delivery details ({STORE_COUNTRY})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guestName">
                Full name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your full name"
                required
                aria-required="true"
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestPhone">
                Mobile number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="guestPhone"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="03XXXXXXXXX"
                required
                aria-required="true"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Karachi, Lahore, Islamabad"
                required
                aria-required="true"
                autoComplete="address-level2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">
                Full address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="House / street / area"
                required
                aria-required="true"
                autoComplete="street-address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Order notes (optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Landmark, preferred delivery time…"
              />
            </div>
            <label
              htmlFor="saveDetails"
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/70 bg-muted/30 px-3 py-3"
            >
              <input
                id="saveDetails"
                type="checkbox"
                checked={saveDetails}
                onChange={(e) => setSaveDetails(e.target.checked)}
                className="border-input text-primary mt-0.5 size-4 shrink-0 cursor-pointer rounded accent-current"
              />
              <span className="space-y-0.5">
                <span className="block text-sm font-medium text-foreground">
                  Save my details for next time
                </span>
                <span className="text-muted-foreground block text-xs">
                  We&apos;ll autofill your name, phone, and address on this
                  device.
                </span>
              </span>
            </label>
            <p className="text-muted-foreground text-sm">
              Payment method: <strong>Cash on Delivery (COD)</strong> — pay when
              your order arrives. No online payment required.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 h-fit">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.product_id}
                className="flex justify-between gap-2 text-sm"
              >
                <span className="line-clamp-2">
                  {item.title} × {item.quantity}
                </span>
                <span className="shrink-0 font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-3 text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>{formatCurrency(shippingPrice)}</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={submitting || !isFormValid}
            >
              {submitting ? 'Placing order…' : 'Place COD Order'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
