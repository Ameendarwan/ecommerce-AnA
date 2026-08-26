"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Archive,
  CheckCircle2,
  CircleHelp,
  MoreVertical,
  Trash2,
} from "lucide-react";
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
  adminQuestionService,
  QuestionFilters,
  QuestionWithDetails,
} from "@/services/admin/adminQuestionService";
import { adminCategoryService } from "@/services/admin/adminCategoryService";
import { adminProductService } from "@/services/admin/adminProductService";
import { CategoryType, QuestionStatus } from "@/types";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "answered", label: "Answered" },
  { value: "archived", label: "Archived" },
] as const;

const STATUS_BADGE_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  answered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  archived: "bg-slate-50 text-slate-600 ring-slate-200",
};

const STATUS_BADGE_DOTS: Record<string, string> = {
  pending: "bg-amber-500",
  answered: "bg-emerald-500",
  archived: "bg-slate-400",
};

type ProductOption = {
  product_id: string;
  title: string;
  category_id?: number | null;
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<QuestionFilters>({});
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [questionToDelete, setQuestionToDelete] =
    useState<QuestionWithDetails | null>(null);
  const pageLimit = 10;

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminQuestionService.getAllQuestions(
        filters,
        currentPage,
        pageLimit,
      );
      setQuestions(data.questions);
      setTotalQuestions(data.total);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    void fetchQuestions();
  }, [fetchQuestions]);

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

  const filteredQuestions = useMemo(() => {
    if (!searchTerm.trim()) return questions;
    const q = searchTerm.toLowerCase();
    return questions.filter(
      (item) =>
        item.question?.toLowerCase().includes(q) ||
        item.name?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.product?.title?.toLowerCase().includes(q) ||
        item.id.toString().includes(q),
    );
  }, [questions, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(totalQuestions / pageLimit));

  const handleStatusUpdate = async (
    question: QuestionWithDetails,
    status: QuestionStatus,
  ) => {
    try {
      setUpdatingId(question.id);
      await adminQuestionService.updateQuestionStatus(question.id, status);
      toast.success(`Marked as ${status}`);
      await fetchQuestions();
    } catch (error) {
      console.error("Error updating question status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;
    try {
      setUpdatingId(questionToDelete.id);
      await adminQuestionService.deleteQuestion(questionToDelete.id);
      toast.success("Question deleted");
      setQuestionToDelete(null);
      await fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: AdminDataTableColumn<QuestionWithDetails>[] = useMemo(
    () => [
      {
        key: "asker",
        header: "Customer",
        render: (item) => {
          const initials = item.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <AdminEntityCell
              initials={initials || "?"}
              title={item.name}
              subtitle={item.email}
            />
          );
        },
      },
      {
        key: "product",
        header: "Product",
        cellClassName: "max-w-[180px]",
        render: (item) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900 dark:text-slate-100">
              {item.product?.title || "—"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {item.product?.category?.name || "Uncategorized"}
            </p>
          </div>
        ),
      },
      {
        key: "question",
        header: "Question",
        cellClassName: "max-w-[280px]",
        render: (item) => (
          <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
            {item.question?.trim() || "—"}
          </p>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (item) => (
          <AdminStatusPill
            label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            tone={item.status}
            styles={STATUS_BADGE_STYLES}
            dots={STATUS_BADGE_DOTS}
          />
        ),
      },
      {
        key: "date",
        header: "Date",
        cellClassName: "text-slate-600 whitespace-nowrap dark:text-slate-300",
        render: (item) =>
          item.created_at
            ? format(new Date(item.created_at), "MMM dd, yyyy")
            : "—",
      },
      {
        key: "actions",
        header: "Actions",
        headerClassName: "w-12 text-right",
        cellClassName: "text-right",
        render: (item) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  disabled={updatingId === item.id}
                  className="text-muted-foreground hover:bg-muted inline-flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-50"
                  aria-label={`Actions for question ${item.id}`}
                >
                  <MoreVertical className="size-4" />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {item.status !== "answered" && (
                  <DropdownMenuItem
                    onClick={() => void handleStatusUpdate(item, "answered")}
                  >
                    <CheckCircle2 className="size-4" />
                    Mark answered
                  </DropdownMenuItem>
                )}
                {item.status !== "pending" && (
                  <DropdownMenuItem
                    onClick={() => void handleStatusUpdate(item, "pending")}
                  >
                    <CircleHelp className="size-4" />
                    Mark pending
                  </DropdownMenuItem>
                )}
                {item.status !== "archived" && (
                  <DropdownMenuItem
                    onClick={() => void handleStatusUpdate(item, "archived")}
                  >
                    <Archive className="size-4" />
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setQuestionToDelete(item)}
                >
                  <Trash2 className="size-4" />
                  Delete question
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [updatingId],
  );

  if (loading && questions.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Question Management
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Browse customer product questions, filter by status or product, and
          mark them answered.
        </p>
      </div>

      <AdminTableToolbar
        searchPlaceholder="Search by question, name, email, or product…"
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
              value={filters.status || "all"}
              onValueChange={(value) => {
                const next = value ?? "all";
                setFilters((prev) => ({
                  ...prev,
                  status:
                    next === "all" ? undefined : (next as QuestionStatus),
                }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-10! w-full rounded-lg data-[size=default]:h-10! sm:w-40">
                <SelectValue placeholder="All Statuses">
                  {STATUS_OPTIONS.find(
                    (option) =>
                      option.value === (filters.status || "all"),
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
        data={filteredQuestions}
        getRowKey={(item) => item.id}
        emptyIcon={<CircleHelp className="size-10 opacity-40" />}
        emptyTitle="No questions found"
        isLoading={loading}
      />

      <AdminTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalQuestions}
        visibleCount={filteredQuestions.length}
        onPageChange={setCurrentPage}
        isLoading={loading}
      />

      <DeleteConfirmModal
        isOpen={Boolean(questionToDelete)}
        onClose={() => setQuestionToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Question"
        description={
          questionToDelete
            ? `Delete the question from "${questionToDelete.name}"${
                questionToDelete.product?.title
                  ? ` about "${questionToDelete.product.title}"`
                  : ""
              }? This cannot be undone.`
            : "Delete this question? This cannot be undone."
        }
        loading={updatingId !== null}
      />
    </div>
  );
}
