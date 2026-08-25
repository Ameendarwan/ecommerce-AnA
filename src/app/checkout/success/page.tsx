import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { getCodOrderSummary } from '@/app/checkout/placeCodOrder';

type SuccessPageProps = {
  searchParams: Promise<{ order_id?: string; total?: string }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderIdParam = params.order_id ? Number(params.order_id) : null;
  const totalFallback = params.total ? Number(params.total) : null;

  const summary =
    orderIdParam != null && !Number.isNaN(orderIdParam)
      ? await getCodOrderSummary(orderIdParam)
      : null;

  const orderId = summary?.orderId ?? orderIdParam;
  const total =
    summary?.total ??
    (totalFallback != null && !Number.isNaN(totalFallback)
      ? totalFallback
      : null);
  const subtotal =
    summary?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ??
    null;

  return (
    <div className="bg-background min-h-screen py-12">
      <Card className="mx-auto max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Order placed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-muted-foreground">
              Your Cash on Delivery order is confirmed. Please keep cash ready
              for the courier.
            </p>
            {orderId != null && !Number.isNaN(orderId) && (
              <p className="text-foreground text-lg font-semibold">
                Order #{orderId}
              </p>
            )}
            {summary?.guestName && (
              <p className="text-muted-foreground text-sm">
                Delivering to {summary.guestName}
                {summary.shippingCity ? ` · ${summary.shippingCity}` : ''}
              </p>
            )}
          </div>

          {summary && summary.items.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <h2 className="text-base font-semibold">What you ordered</h2>
              <ul className="space-y-3">
                {summary.items.map((item) => (
                  <li
                    key={item.product_id}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={48}
                          height={48}
                          className="h-12 w-12 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="bg-muted h-12 w-12 shrink-0 rounded" />
                      )}
                      <div className="min-w-0">
                        <p className="line-clamp-2 font-medium">{item.title}</p>
                        <p className="text-muted-foreground">
                          Qty {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-1 border-t pt-3 text-sm">
                {subtotal != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(summary.shippingFee)}</span>
                </div>
                <div className="flex justify-between pt-1 text-base font-bold">
                  <span>Total due on delivery</span>
                  <span>{formatCurrency(summary.total)}</span>
                </div>
              </div>
            </div>
          )}

          {!summary && total != null && (
            <p className="text-muted-foreground text-center">
              Total due on delivery: {formatCurrency(total)}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/" className="w-full sm:w-auto">
              <Button className="w-full cursor-pointer sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
