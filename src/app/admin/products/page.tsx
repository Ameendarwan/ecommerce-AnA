"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  Edit,
  Eye,
  EyeOff,
  MoreVertical,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
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
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import {
  AdminDataTable,
  AdminStatusPill,
  AdminTablePagination,
  AdminTableToolbar,
  type AdminDataTableColumn,
} from "@/components/admin/table";
import {
  adminProductService,
  CreateProductData,
  ProductFilters,
  ProductWithDetails,
  UpdateProductData,
} from "@/services/admin/adminProductService";
import { adminCategoryService } from "@/services/admin/adminCategoryService";
import { CategoryType } from "@/types";
import { formatCurrency } from "@/utils/formatCurrency";
import { getProductDeleteErrorMessage } from "@/utils/errorHandling";
import { invalidateStorefrontCatalog } from "@/lib/cache/invalidateStorefrontCatalog";

const VISIBILITY_OPTIONS = [
  { value: "all", label: "All Visibility" },
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
] as const;

const STOCK_OPTIONS = [
  { value: "all", label: "All Stock" },
  { value: "low", label: "Low Stock" },
] as const;

const VISIBILITY_STYLES: Record<string, string> = {
  visible: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  hidden: "bg-slate-50 text-slate-600 ring-slate-200",
};

const VISIBILITY_DOTS: Record<string, string> = {
  visible: "bg-emerald-500",
  hidden: "bg-slate-400",
};

const STOCK_STYLES: Record<string, string> = {
  ok: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  low: "bg-rose-50 text-rose-700 ring-rose-200",
  out: "bg-orange-50 text-orange-700 ring-orange-200",
};

const STOCK_DOTS: Record<string, string> = {
  ok: "bg-emerald-500",
  low: "bg-rose-500",
  out: "bg-orange-500",
};

function getStockTone(stock: number): { label: string; tone: string } {
  if (stock <= 0) return { label: "Out of stock", tone: "out" };
  if (stock <= 5) return { label: "Low stock", tone: "low" };
  return { label: "In stock", tone: "ok" };
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ProductFilters>({});
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ProductWithDetails | null>(null);
  const [productToDelete, setProductToDelete] =
    useState<ProductWithDetails | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const pageLimit = 10;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminProductService.getAllProducts(
        filters,
        currentPage,
        pageLimit,
      );
      setProducts(data.products);
      setTotalProducts(data.total);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    void (async () => {
      try {
        const cats = await adminCategoryService.getAllCategories();
        setCategories(cats.categories);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    })();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const q = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.sku?.toLowerCase().includes(q) ||
        product.category?.name?.toLowerCase().includes(q),
    );
  }, [products, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / pageLimit));

  const syncStorefront = (productIds?: string[]) => {
    void invalidateStorefrontCatalog(queryClient, { productIds });
  };

  const handleCreateProduct = async (productData: CreateProductData) => {
    try {
      const created = await adminProductService.createProduct(productData);
      toast.success("Product created successfully");
      setShowCreateModal(false);
      await fetchProducts();
      syncStorefront([created.product_id]);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    }
  };

  const handleUpdateProduct = async (
    productId: string,
    productData: UpdateProductData,
  ) => {
    try {
      await adminProductService.updateProduct(productId, productData);
      toast.success("Product updated successfully");
      setEditingProduct(null);
      await fetchProducts();
      syncStorefront([productId]);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleToggleVisibility = async (product: ProductWithDetails) => {
    try {
      setUpdatingId(product.product_id);
      const nextVisible = product.is_visible === false;
      await adminProductService.updateProduct(product.product_id, {
        is_visible: nextVisible,
      });
      toast.success(
        nextVisible ? "Product is now visible" : "Product is now hidden",
      );
      await fetchProducts();
      syncStorefront([product.product_id]);
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error("Failed to update visibility");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      setDeletingId(productToDelete.product_id);
      await adminProductService.deleteProduct(productToDelete.product_id);
      toast.success("Product deleted successfully");
      setProductToDelete(null);
      await fetchProducts();
      syncStorefront([productToDelete.product_id]);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(getProductDeleteErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  const columns: AdminDataTableColumn<ProductWithDetails>[] = useMemo(
    () => [
      {
        key: "product",
        header: "Product",
        cellClassName: "max-w-[260px]",
        render: (product) => (
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center">
                  <Package className="size-4" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">
                {product.title}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {product.sku ? `SKU: ${product.sku}` : "No SKU"}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "category",
        header: "Category",
        cellClassName: "text-slate-600",
        render: (product) => product.category?.name || "Uncategorized",
      },
      {
        key: "price",
        header: "Price",
        cellClassName: "whitespace-nowrap",
        render: (product) => {
          const discount = product.discount_percent ?? 0;
          const hasDiscount = discount > 0;
          const salePrice = hasDiscount
            ? product.price * (1 - discount / 100)
            : product.price;

          return (
            <div>
              <p className="font-medium text-slate-900">
                {formatCurrency(salePrice)}
              </p>
              {hasDiscount ? (
                <p className="text-xs text-slate-500">
                  <span className="line-through">
                    {formatCurrency(product.price)}
                  </span>{" "}
                  · {discount}% off
                </p>
              ) : null}
            </div>
          );
        },
      },
      {
        key: "stock",
        header: "Stock",
        render: (product) => {
          const stock = getStockTone(product.stock);
          return (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-sm font-medium text-slate-900">
                {product.stock}
              </span>
              <AdminStatusPill
                label={stock.label}
                tone={stock.tone}
                styles={STOCK_STYLES}
                dots={STOCK_DOTS}
              />
            </div>
          );
        },
      },
      {
        key: "visibility",
        header: "Visibility",
        render: (product) => {
          const isVisible = product.is_visible !== false;
          return (
            <AdminStatusPill
              label={isVisible ? "Visible" : "Hidden"}
              tone={isVisible ? "visible" : "hidden"}
              styles={VISIBILITY_STYLES}
              dots={VISIBILITY_DOTS}
            />
          );
        },
      },
      {
        key: "reviews",
        header: "Reviews",
        cellClassName: "text-slate-600 whitespace-nowrap",
        render: (product) => {
          const total = product.total_reviews ?? 0;
          if (total === 0) return "—";
          return `${total}${
            product.average_rating ? ` · ${product.average_rating}★` : ""
          }`;
        },
      },
      {
        key: "created",
        header: "Created",
        cellClassName: "text-slate-600 whitespace-nowrap",
        render: (product) =>
          product.created_at
            ? format(new Date(product.created_at), "MMM dd, yyyy")
            : "—",
      },
      {
        key: "actions",
        header: "Actions",
        headerClassName: "w-12 text-right",
        cellClassName: "text-right",
        render: (product) => {
          const isBusy =
            deletingId === product.product_id ||
            updatingId === product.product_id;
          const isVisible = product.is_visible !== false;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    disabled={isBusy}
                    className="text-muted-foreground hover:bg-muted inline-flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-50"
                    aria-label={`Actions for ${product.title}`}
                  >
                    <MoreVertical className="size-4" />
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    render={
                      <Link href={`/products/${product.product_id}`} />
                    }
                  >
                    <Eye className="size-4" />
                    View product
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                    <Edit className="size-4" />
                    Edit product
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => void handleToggleVisibility(product)}
                  >
                    {isVisible ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                    {isVisible ? "Hide product" : "Show product"}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setProductToDelete(product)}
                  >
                    <Trash2 className="size-4" />
                    Delete product
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [deletingId, updatingId],
  );

  if (loading && products.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Product Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Browse, filter, and manage your product catalog.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="cursor-pointer"
        >
          <Plus className="mr-2 size-4" />
          Add Product
        </Button>
      </div>

      <AdminTableToolbar
        searchPlaceholder="Search by title, SKU, or category…"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={
          <>
            <Select
              value={filters.categoryId?.toString() || "all"}
              onValueChange={(value) => {
                const next = value ?? "all";
                setFilters((prev) => ({
                  ...prev,
                  categoryId: next === "all" ? undefined : Number(next),
                }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-10! w-full rounded-lg data-[size=default]:h-10! sm:w-44">
                <SelectValue placeholder="All Categories">
                  {filters.categoryId
                    ? (categories.find((c) => c.id === filters.categoryId)
                        ?.name ?? "All Categories")
                    : "All Categories"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={
                filters.isVisible === undefined
                  ? "all"
                  : filters.isVisible
                    ? "visible"
                    : "hidden"
              }
              onValueChange={(value) => {
                const next = value ?? "all";
                setFilters((prev) => ({
                  ...prev,
                  isVisible:
                    next === "all"
                      ? undefined
                      : next === "visible"
                        ? true
                        : false,
                }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-10! w-full rounded-lg data-[size=default]:h-10! sm:w-40">
                <SelectValue placeholder="All Visibility">
                  {VISIBILITY_OPTIONS.find(
                    (option) =>
                      option.value ===
                      (filters.isVisible === undefined
                        ? "all"
                        : filters.isVisible
                          ? "visible"
                          : "hidden"),
                  )?.label ?? "All Visibility"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.lowStock ? "low" : "all"}
              onValueChange={(value) => {
                const next = value ?? "all";
                setFilters((prev) => ({
                  ...prev,
                  lowStock: next === "low" ? true : undefined,
                }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-10! w-full rounded-lg data-[size=default]:h-10! sm:w-36">
                <SelectValue placeholder="All Stock">
                  {STOCK_OPTIONS.find(
                    (option) =>
                      option.value === (filters.lowStock ? "low" : "all"),
                  )?.label ?? "All Stock"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STOCK_OPTIONS.map((option) => (
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
        data={filteredProducts}
        getRowKey={(product) => product.product_id}
        emptyIcon={<Package className="size-10 opacity-40" />}
        emptyTitle="No products found"
        isLoading={loading}
      />

      <AdminTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalProducts}
        visibleCount={filteredProducts.length}
        onPageChange={setCurrentPage}
        isLoading={loading}
      />

      <ProductFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProduct}
        title="Create New Product"
      />

      <ProductFormModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSubmit={(data) =>
          handleUpdateProduct(editingProduct!.product_id, data)
        }
        product={editingProduct}
        title="Edit Product"
      />

      <DeleteConfirmModal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        description={
          productToDelete
            ? `Are you sure you want to delete "${productToDelete.title}"? This action cannot be undone.`
            : "Delete this product? This cannot be undone."
        }
        loading={deletingId !== null}
      />
    </div>
  );
}
