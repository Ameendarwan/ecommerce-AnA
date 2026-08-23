"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ShoppingSkeleton from "@/components/ShoppingSkeleton";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { formatCurrency } from "@/utils/formatCurrency";
import { SHIPPING_PKR } from "@/lib/shipping";

export default function CartShoppingPage() {
  const { cartItems, removeFromCart, updateQuantity, subtotal, isLoading } =
    useCart();

  if (isLoading) {
    return <ShoppingSkeleton />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center">
        <Link href="/" className="text-primary flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shopping
        </Link>
        <h1 className="ml-4 text-3xl font-bold">Your Shopping Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="p-8 text-center">
          <h2 className="mb-4 text-xl">Your cart is empty</h2>
          <Link href="/">
            <Button className="cursor-pointer">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            {cartItems.map((item) => (
              <Card key={item.product_id} className="mb-4">
                <div className="flex flex-col sm:flex-row">
                  <div className="p-4 sm:w-1/4">
                    <Image
                      src={item.image || ""}
                      alt={item.title}
                      width={100}
                      height={100}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                  <CardContent className="flex-1 p-4">
                    <CardTitle className="mb-2 text-xl">{item.title}</CardTitle>
                    <p className="text-muted-foreground mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    <p className="text-lg font-bold">
                      {formatCurrency(item.price)}
                    </p>
                    {item.stock <= 1 && (
                      <p className="text-muted-foreground mt-1 text-sm">
                        Unique used item — 1 available
                      </p>
                    )}

                    <div className="mt-4 flex items-center">
                      {item.stock > 1 && (
                        <>
                          <Button
                            type="button"
                            className="border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 cursor-pointer rounded-md border p-0 shadow-xs"
                            onClick={(e) => {
                              e.preventDefault();
                              updateQuantity(item.product_id, -1);
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="mx-3">{item.quantity}</span>
                          <Button
                            type="button"
                            className="border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 cursor-pointer rounded-md border p-0 shadow-xs"
                            onClick={(e) => {
                              e.preventDefault();
                              updateQuantity(item.product_id, 1);
                            }}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {item.stock <= 1 && (
                        <span className="text-muted-foreground mr-4 text-sm">
                          Qty: {item.quantity}
                        </span>
                      )}
                      <Button
                        type="button"
                        className="text-destructive hover:bg-accent hover:text-accent-foreground ml-4 cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          removeFromCart(item.product_id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping (Pakistan)</span>
                    <span>{formatCurrency(SHIPPING_PKR)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-4 text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(subtotal + SHIPPING_PKR)}</span>
                  </div>
                  <p className="text-muted-foreground pt-2 text-sm">
                    Payment: Cash on Delivery (COD)
                  </p>
                </div>
              </CardContent>
              <CardFooter>
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
