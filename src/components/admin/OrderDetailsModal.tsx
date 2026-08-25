"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { User, MapPin, Calendar, Package, DollarSign } from "lucide-react";
import { OrderWithDetails } from "@/services/admin/adminOrderService";
import { useOrder } from "@/hooks/queries";
import { formatCurrency } from "@/utils/formatCurrency";
import { format } from "date-fns";
import Image from "next/image";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderWithDetails;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
    case "shipped":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "processing":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "cancelled":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

function formatPaymentMethod(method?: string | null) {
  if (!method) return "COD";
  const normalized = method.trim().toLowerCase();
  if (normalized === "cod" || normalized === "cash on delivery") return "COD";
  return method.trim().toUpperCase();
}

export function OrderDetailsModal({
  isOpen,
  onClose,
  order,
}: OrderDetailsModalProps) {
  const { data: orderDetails, isLoading: loading } = useOrder(
    isOpen && order ? order.id.toString() : "",
  );

  if (!order) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="shrink-0 border-b px-6 py-5 pr-12">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 shrink-0" />
            Order #{order.id}
          </DialogTitle>
          <DialogDescription>
            View detailed order information, customer details, and items
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(90vh-9.5rem)] overflow-y-auto overscroll-contain">
          <div className="space-y-6 px-6 py-5">
            {/* Order Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-slate-700">
                    Order Date
                  </p>
                  <p className="text-sm text-slate-600">
                    {order.created_at
                      ? format(
                          new Date(order.created_at),
                          "MMM dd, yyyy 'at' HH:mm",
                        )
                      : "Unknown date"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-slate-700">
                    Total Amount
                  </p>
                  <p className="text-lg font-bold text-emerald-600">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-slate-700">Status</p>
                  <Badge
                    className={`${getStatusColor(order.status)} border capitalize`}
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-slate-700">
                    Payment Method
                  </p>
                  <p className="text-sm font-semibold tracking-wide text-slate-700">
                    {formatPaymentMethod(order.payment_method)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Customer Information */}
            <div>
              <h3 className="mb-3 flex flex-wrap items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5 shrink-0" />
                Customer Information
                {!order.user_id && (
                  <Badge variant="outline" className="text-xs">
                    Guest
                  </Badge>
                )}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-slate-700">Name</p>
                  <p className="text-sm wrap-break-word text-slate-600">
                    {order.profile?.username ||
                      order.guest_name ||
                      "Not provided"}
                  </p>
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-slate-700">
                    {order.user_id ? "Email" : "Phone"}
                  </p>
                  <p className="text-sm wrap-break-word text-slate-600">
                    {order.user_id
                      ? order.profile?.email || "Not provided"
                      : order.guest_phone || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Shipping Address */}
            {(order.shipping_address ||
              order.shipping_street ||
              order.shipping_city) && (
              <>
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                    <MapPin className="h-5 w-5 shrink-0" />
                    Shipping Address
                  </h3>
                  <div className="bg-card rounded-lg border p-4">
                    {order.shipping_address ? (
                      <div className="space-y-1">
                        <p className="text-foreground font-medium wrap-break-word">
                          {order.shipping_address.street}
                        </p>
                        <p className="text-muted-foreground text-sm wrap-break-word">
                          {[
                            order.shipping_address.city,
                            order.shipping_address.state,
                            order.shipping_address.zip_code,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {order.shipping_address.country ? (
                          <p className="text-muted-foreground text-sm">
                            {order.shipping_address.country}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-foreground font-medium wrap-break-word">
                          {order.shipping_street}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {order.shipping_city}
                        </p>
                        {order.shipping_notes ? (
                          <p className="text-muted-foreground mt-2 text-sm wrap-break-word">
                            Notes: {order.shipping_notes}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Order Items */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <Package className="h-5 w-5 shrink-0" />
                Order Items
              </h3>

              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="text-muted-foreground text-sm">
                    Loading items...
                  </div>
                </div>
              ) : orderDetails?.order_items ? (
                <div className="space-y-3">
                  {orderDetails.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-card flex items-start gap-4 rounded-lg border p-4"
                    >
                      <div className="bg-muted h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                        {item.product?.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product?.title || "Product"}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="text-muted-foreground h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="text-foreground font-medium wrap-break-word">
                          {item.product?.title || "Product"}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Unit Price: {formatCurrency(item.price)}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-foreground font-semibold whitespace-nowrap">
                          {formatCurrency(item.quantity * item.price)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="bg-card rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-foreground text-lg font-semibold">
                        Total
                      </span>
                      <span className="text-lg font-bold whitespace-nowrap text-emerald-600">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-lg border p-8 text-center">
                  <Package className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                  <p className="text-muted-foreground">
                    No items found for this order
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-end border-t px-6 py-4">
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
