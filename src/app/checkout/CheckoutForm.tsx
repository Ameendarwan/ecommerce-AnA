'use client';

import { useState } from 'react';
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
import { SHIPPING_PKR, STORE_COUNTRY } from '@/lib/shipping';
import { placeCodOrder } from '@/app/checkout/placeCodOrder';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function CheckoutForm() {
  const { cartItems, subtotal, clearCart, isLoading } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center p-4">
        <p className="text-muted-foreground">Loading checkout…</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="mb-4 text-2xl font-bold">Your cart is empty</h1>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const total = subtotal + SHIPPING_PKR;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      clearCart({ silent: true });
      toast.success('Order placed — pay cash on delivery');
      router.push(
        `/checkout/success?order_id=${result.orderId}&total=${result.total}`
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6 flex items-center">
        <Link href="/cart" className="text-primary flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Link>
        <h1 className="ml-4 text-3xl font-bold">Checkout</h1>
      </div>

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
              <Label htmlFor="guestName">Full name</Label>
              <Input
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your full name"
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestPhone">Mobile number</Label>
              <Input
                id="guestPhone"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="03XXXXXXXXX"
                required
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Karachi, Lahore, Islamabad"
                required
                autoComplete="address-level2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Full address</Label>
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="House / street / area"
                required
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
              <span>{formatCurrency(SHIPPING_PKR)}</span>
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
              disabled={submitting}
            >
              {submitting ? 'Placing order…' : 'Place COD Order'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
