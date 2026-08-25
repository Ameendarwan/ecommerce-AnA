"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Eye, MoreVertical, Package } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { OrderDetailsModal } from "@/components/admin/OrderDetailsModal";
import {
  AdminDataTable,
  AdminEntityCell,
  AdminStatusPill,
  AdminTablePagination,
  AdminTableToolbar,
  type AdminDataTableColumn,
} from "@/components/admin/table";
import {
  adminOrderService,
  OrderFilters,
  OrderWithDetails,
} from "@/services/admin/adminOrderService";
import { formatCurrency } from "@/utils/formatCurrency";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
] as const;

function getCustomerName(order: OrderWithDetails) {
  return (
    order.profile?.username ||
    order.guest_name ||
    order.profile?.email ||
    "Guest"
  );
}

function getCustomerSubtext(order: OrderWithDetails) {
  if (order.guest_phone) return order.guest_phone;
  if (order.profile?.email && order.profile.username)
    return order.profile.email;
  if (!order.user_id) return "COD guest";
  return "Registered";
}

function getLocation(order: OrderWithDetails) {
  if (order.shipping_address?.city) {
    return [order.shipping_address.city, order.shipping_address.state]
      .filter(Boolean)
      .join(", ");
  }
  if (order.shipping_city) return order.shipping_city;
  return "—";
}

function getPayment(order: OrderWithDetails) {
  const method = order.payment_method?.toLowerCase();
  if (!method || method === "cod") return "COD";
  return method.toUpperCase();
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<OrderFilters>({});
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const pageLimit = 10;

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminOrderService.getAllOrders(
        filters,
        currentPage,
        pageLimit,
      );
      setOrders(data.orders);
      setTotalOrders(data.total);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    const q = searchTerm.toLowerCase();
    return orders.filter(
      (order) =>
        order.id.toString().includes(q) ||
        order.profile?.username?.toLowerCase().includes(q) ||
        order.profile?.email?.toLowerCase().includes(q) ||
        order.guest_name?.toLowerCase().includes(q) ||
        order.guest_phone?.toLowerCase().includes(q) ||
        order.shipping_city?.toLowerCase().includes(q) ||
        order.shipping_address?.city?.toLowerCase().includes(q),
    );
  }, [orders, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(totalOrders / pageLimit));

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      await adminOrderService.updateOrderStatus(orderId, newStatus);
      toast.success("Order status updated");
      await fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const openDetails = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const columns: AdminDataTableColumn<OrderWithDetails>[] = useMemo(
    () => [
      {
        key: "order",
        header: "Order",
        render: (order) => {
          const name = getCustomerName(order);
          const initials = name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          const subtext = getCustomerSubtext(order);

          return (
            <AdminEntityCell
              initials={initials}
              title={`Order #${order.id}`}
              subtitle={
                subtext ? `${name}${subtext ? ` · ${subtext}` : ""}` : name
              }
            />
          );
        },
      },
      {
        key: "date",
        header: "Date",
        cellClassName: "text-slate-600",
        render: (order) =>
          order.created_at
            ? format(new Date(order.created_at), "MMM dd, yyyy")
            : "—",
      },
      {
        key: "payment",
        header: "Payment",
        render: (order) => (
          <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200 ring-inset">
            {getPayment(order)}
          </span>
        ),
      },
      {
        key: "total",
        header: "Total",
        cellClassName: "font-semibold text-slate-900",
        render: (order) => formatCurrency(order.total),
      },
      {
        key: "location",
        header: "Location",
        cellClassName: "max-w-[160px] truncate text-slate-600",
        render: (order) => getLocation(order),
      },
      {
        key: "status",
        header: "Status",
        render: (order) => (
          <AdminStatusPill
            label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            tone={order.status}
          />
        ),
      },
      {
        key: "actions",
        header: "Actions",
        headerClassName: "w-12 text-right",
        cellClassName: "text-right",
        render: (order) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  disabled={updatingId === order.id}
                  className="text-muted-foreground hover:bg-muted inline-flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-50"
                  aria-label={`Actions for order ${order.id}`}
                >
                  <MoreVertical className="size-4" />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openDetails(order)}>
                  <Eye className="size-4" />
                  View details
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Set status</DropdownMenuLabel>
                {STATUS_OPTIONS.filter((option) => option.value !== "all").map(
                  (option) => (
                    <DropdownMenuItem
                      key={option.value}
                      disabled={order.status === option.value}
                      onClick={() => handleStatusChange(order.id, option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [updatingId],
  );

  if (loading && orders.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review orders, update fulfillment status, and view customer details.
        </p>
      </div>

      <AdminTableToolbar
        searchPlaceholder="Search by order ID, name, phone, or city…"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={
          <>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => {
                const next = value ?? "all";
                setFilters((prev) => ({
                  ...prev,
                  status: next === "all" ? undefined : next,
                }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-10! w-full rounded-lg data-[size=default]:h-10! sm:w-40">
                <SelectValue placeholder="All Statuses">
                  {STATUS_OPTIONS.find(
                    (option) => option.value === (filters.status || "all"),
                  )?.label ?? "All Statuses"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  dateFrom: e.target.value || undefined,
                }));
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-lg sm:w-40"
              aria-label="From date"
            />

            <Input
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  dateTo: e.target.value || undefined,
                }));
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-lg sm:w-40"
              aria-label="To date"
            />
          </>
        }
      />

      <AdminDataTable
        columns={columns}
        data={filteredOrders}
        getRowKey={(order) => order.id}
        emptyIcon={<Package className="size-10 opacity-40" />}
        emptyTitle="No orders found"
        isLoading={loading}
      />

      <AdminTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalOrders}
        visibleCount={filteredOrders.length}
        onPageChange={setCurrentPage}
        isLoading={loading}
      />

      {selectedOrder ? (
        <OrderDetailsModal
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      ) : null}
    </div>
  );
}
