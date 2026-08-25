"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ShoppingSkeleton from "@/components/ShoppingSkeleton";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { formatCurrency } from "@/utils/formatCurrency";
import { useStoreSettings } from "@/hooks/queries/use-store-settings";
import { DEFAULT_STORE_SETTINGS } from "@/lib/storeSettingsDefaults";

export default function CartShoppingPage() {
  const { cartItems, removeFromCart, updateQuantity, subtotal, isLoading } =
    useCart();
  const { data: settings } = useStoreSettings();
  const shippingPrice =
    settings?.shipping_price ?? DEFAULT_STORE_SETTINGS.shipping_price;

  if (isLoading) {
    return <ShoppingSkeleton />;
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
        Your Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="mb-4 text-xl font-medium">Your cart is empty</h2>
          <Link href="/">
            <Button className="cursor-pointer">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            {cartItems.map((item) => (
              <Card
                key={item.product_id}
                className="gap-0 overflow-hidden py-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-stretch">
                  <div className="bg-muted relative aspect-square w-full shrink-0 sm:aspect-auto sm:h-auto sm:w-36 md:w-40">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 160px"
                      />
                    ) : (
                      <div className="text-muted-foreground flex h-full min-h-36 items-center justify-center text-sm">
                        No image
                      </div>
                    )}
                  </div>

                  <CardContent className="flex flex-1 flex-col justify-between gap-4 px-4 py-4 sm:px-5">
                    <div className="space-y-1">
                      <h2 className="text-base font-semibold leading-snug sm:text-lg">
                        {item.title}
                      </h2>
                      <p className="text-muted-foreground line-clamp-2 text-sm">
                        {item.description}
                      </p>
                      <p className="pt-1 text-base font-bold">
                        {formatCurrency(item.price)}
                      </p>
                      {item.stock <= 1 && (
                        <p className="text-muted-foreground text-sm">
                          Unique used item — 1 available
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {item.stock > 1 ? (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="size-9 shrink-0 cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                updateQuantity(item.product_id, -1);
                              }}
                            >
                              <Minus className="size-4" />
                            </Button>
                            <span className="min-w-8 text-center text-sm font-medium tabular-nums">
                              {item.quantity}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="size-9 shrink-0 cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                updateQuantity(item.product_id, 1);
                              }}
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="size-4" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Qty: {item.quantity}
                          </span>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive size-9 shrink-0 cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          removeFromCart(item.product_id);
                        }}
                        aria-label="Remove from cart"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20 gap-0 py-0">
              <CardHeader className="px-4 py-4 sm:px-5">
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium tabular-nums">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Shipping (Pakistan)
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatCurrency(shippingPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 text-base font-bold">
                    <span>Total</span>
                    <span className="tabular-nums">
                      {formatCurrency(subtotal + shippingPrice)}
                    </span>
                  </div>
                  <p className="text-muted-foreground pt-1 text-sm">
                    Payment: Cash on Delivery (COD)
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-t px-4 py-4 sm:px-5">
                <Link href="/checkout" className="w-full">
                  <Button className="w-full cursor-pointer">
                    Proceed to Checkout
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
