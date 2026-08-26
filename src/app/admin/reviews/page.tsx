"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { MessageSquare, MoreVertical, Star, Trash2 } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import {
  AdminDataTable,
  AdminEntityCell,
  AdminStatusPill,
  AdminTablePagination,
  AdminTableToolbar,
  type AdminDataTableColumn,
} from "@/components/admin/table";
import {
  adminReviewService,
  ReviewFilters,
  ReviewWithDetails,
} from "@/services/admin/adminReviewService";
import { adminCategoryService } from "@/services/admin/adminCategoryService";
import { adminProductService } from "@/services/admin/adminProductService";
import { CategoryType } from "@/types";

const RATING_OPTIONS = [
  { value: "all", label: "All Ratings" },
  { value: "5", label: "5 Stars" },
  { value: "4", label: "4 Stars" },
  { value: "3", label: "3 Stars" },
  { value: "2", label: "2 Stars" },
  { value: "1", label: "1 Star" },
] as const;

const RATING_BADGE_STYLES: Record<string, string> = {
  excellent: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  good: "bg-sky-50 text-sky-700 ring-sky-200",
  average: "bg-amber-50 text-amber-700 ring-amber-200",
  poor: "bg-orange-50 text-orange-700 ring-orange-200",
  bad: "bg-rose-50 text-rose-700 ring-rose-200",
};

const RATING_BADGE_DOTS: Record<string, string> = {
  excellent: "bg-emerald-500",
  good: "bg-sky-500",
  average: "bg-amber-500",
  poor: "bg-orange-500",
  bad: "bg-rose-500",
};

function getRatingBadge(rating: number): { label: string; tone: string } {
  if (rating >= 5) return { label: "Excellent", tone: "excellent" };
  if (rating >= 4) return { label: "Good", tone: "good" };
  if (rating >= 3) return { label: "Average", tone: "average" };
  if (rating >= 2) return { label: "Poor", tone: "poor" };
  return { label: "Bad", tone: "bad" };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-slate-300"
          }`}
        />
      ))}
      <span className="ml-1.5 text-xs font-medium text-slate-600">{rating}</span>
    </div>
  );
}

type ProductOption = {
  product_id: string;
  title: string;
  category_id?: number | null;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ReviewFilters>({});
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewWithDetails | null>(
    null,
  );
  const pageLimit = 10;

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminReviewService.getAllReviews(
        filters,
        currentPage,
        pageLimit,
      );
      setReviews(data.reviews);
      setTotalReviews(data.total);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    void (async () => {
      try {
        const [cats, prods] = await Promise.all([
          adminCategoryService.getAllCategories(),
          adminProductService.getAllProducts({}, 1, 1000),
        ]);
        setCategories(cats.categories);
        setProducts(
          prods.products.map((p) => ({
            product_id: p.product_id,
            title: p.title,
            category_id: p.category_id,
          })),
        );
      } catch (error) {
        console.error("Error loading filter options:", error);
      }
    })();
  }, []);

  const productOptions = useMemo(() => {
    if (!filters.categoryId) return products;
    return products.filter((p) => p.category_id === filters.categoryId);
  }, [products, filters.categoryId]);

  const filteredReviews = useMemo(() => {
    if (!searchTerm.trim()) return reviews;
    const q = searchTerm.toLowerCase();
    return reviews.filter(
      (review) =>
        review.comment?.toLowerCase().includes(q) ||
        review.profile?.username?.toLowerCase().includes(q) ||
        review.profile?.email?.toLowerCase().includes(q) ||
        review.product?.title?.toLowerCase().includes(q) ||
        review.id.toString().includes(q),
    );
  }, [reviews, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(totalReviews / pageLimit));

  const handleDelete = async () => {
    if (!reviewToDelete) return;
    try {
      setDeletingId(reviewToDelete.id);
      await adminReviewService.deleteReview(reviewToDelete.id);
      toast.success("Review deleted");
      setReviewToDelete(null);
      await fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  const columns: AdminDataTableColumn<ReviewWithDetails>[] = useMemo(
    () => [
      {
        key: "reviewer",
        header: "Reviewer",
        render: (review) => {
          const name =
            review.profile?.username ||
            review.profile?.email ||
            "Unknown user";
          const initials = name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <AdminEntityCell
              initials={initials}
              title={name}
              subtitle={
                review.profile?.email && review.profile?.username
                  ? review.profile.email
                  : undefined
              }
            />
          );
        },
      },
      {
        key: "product",
        header: "Product",
        cellClassName: "max-w-[180px]",
        render: (review) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">
              {review.product?.title || "—"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {review.product?.category?.name || "Uncategorized"}
            </p>
          </div>
        ),
      },
      {
        key: "rating",
        header: "Rating",
        render: (review) => <StarRating rating={review.rating} />,
      },
      {
        key: "badge",
        header: "Badge",
        render: (review) => {
          const badge = getRatingBadge(review.rating);
          return (
            <AdminStatusPill
              label={badge.label}
              tone={badge.tone}
              styles={RATING_BADGE_STYLES}
              dots={RATING_BADGE_DOTS}
            />
          );
        },
      },
      {
        key: "comment",
        header: "Comment",
        cellClassName: "max-w-[240px]",
        render: (review) => (
          <p className="line-clamp-2 text-sm text-slate-600">
            {review.comment?.trim() || "—"}
          </p>
        ),
      },
      {
        key: "date",
        header: "Date",
        cellClassName: "text-slate-600 whitespace-nowrap",
        render: (review) =>
          review.created_at
            ? format(new Date(review.created_at), "MMM dd, yyyy")
            : "—",
      },
      {
        key: "actions",
        header: "Actions",
        headerClassName: "w-12 text-right",
        cellClassName: "text-right",
        render: (review) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  disabled={deletingId === review.id}
                  className="text-muted-foreground hover:bg-muted inline-flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-50"
                  aria-label={`Actions for review ${review.id}`}
                >
                  <MoreVertical className="size-4" />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setReviewToDelete(review)}
                >
                  <Trash2 className="size-4" />
                  Delete review
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [deletingId],
  );

  if (loading && reviews.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review Management</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Browse customer reviews, filter by product or rating, and moderate
          feedback.
        </p>
      </div>

      <AdminTableToolbar
        searchPlaceholder="Search by comment, product, or reviewer…"
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
                  // Clear product if it no longer matches the category
                  productId: undefined,
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
              value={filters.productId || "all"}
              onValueChange={(value) => {
                const next = value ?? "all";
                setFilters((prev) => ({
                  ...prev,
                  productId: next === "all" ? undefined : next,
                }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-10! w-full rounded-lg data-[size=default]:h-10! sm:w-48">
                <SelectValue placeholder="All Products">
                  {filters.productId
                    ? (productOptions.find(
                        (p) => p.product_id === filters.productId,
                      )?.title ?? "All Products")
                    : "All Products"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {productOptions.map((product) => (
                  <SelectItem
                    key={product.product_id}
                    value={product.product_id}
                  >
                    {product.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.rating?.toString() || "all"}
              onValueChange={(value) => {
                const next = value ?? "all";
                setFilters((prev) => ({
                  ...prev,
                  rating: next === "all" ? undefined : Number(next),
                }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-10! w-full rounded-lg data-[size=default]:h-10! sm:w-36">
                <SelectValue placeholder="All Ratings">
                  {RATING_OPTIONS.find(
                    (option) =>
                      option.value === (filters.rating?.toString() || "all"),
                  )?.label ?? "All Ratings"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {RATING_OPTIONS.map((option) => (
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
        data={filteredReviews}
        getRowKey={(review) => review.id}
        emptyIcon={<MessageSquare className="size-10 opacity-40" />}
        emptyTitle="No reviews found"
        isLoading={loading}
      />

      <AdminTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalReviews}
        visibleCount={filteredReviews.length}
        onPageChange={setCurrentPage}
        isLoading={loading}
      />

      <DeleteConfirmModal
        isOpen={Boolean(reviewToDelete)}
        onClose={() => setReviewToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        description={
          reviewToDelete
            ? `Delete the ${reviewToDelete.rating}-star review${
                reviewToDelete.product?.title
                  ? ` for "${reviewToDelete.product.title}"`
                  : ""
              }? This cannot be undone.`
            : "Delete this review? This cannot be undone."
        }
        loading={deletingId !== null}
      />
    </div>
  );
}
