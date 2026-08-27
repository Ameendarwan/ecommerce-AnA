"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Edit,
  Eye,
  EyeOff,
  HelpCircle,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  AdminDataTable,
  AdminEntityCell,
  AdminStatusPill,
  AdminTablePagination,
  AdminTableToolbar,
  type AdminDataTableColumn,
} from "@/components/admin/table";
import {
  adminFaqService,
  FaqFilters,
  CreateFaqData,
} from "@/services/admin/adminFaqService";
import { FaqItemType } from "@/types";

const VISIBILITY_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  hidden: "bg-slate-50 text-slate-600 ring-slate-200",
};

const STATUS_DOTS: Record<string, string> = {
  published: "bg-emerald-500",
  hidden: "bg-slate-400",
};

const FAQ_CATEGORIES = [
  "General",
  "Products",
  "Shipping",
  "Payment",
  "Orders",
  "Returns",
  "Support",
];

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FaqItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FaqFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalFaqsCount, setTotalFaqsCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItemType | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<FaqItemType | null>(null);

  // Form states
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [formOrderIndex, setFormOrderIndex] = useState(0);
  const [formPublished, setFormPublished] = useState(true);
  const [formError, setFormError] = useState("");

  const pageLimit = 10;

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminFaqService.getAllFaqs(
        filters,
        currentPage,
        pageLimit,
      );
      setFaqs(data.faqs);
      setTotalFaqsCount(data.total);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    void fetchFaqs();
  }, [fetchFaqs]);

  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) return faqs;
    const q = searchTerm.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        (faq.category && faq.category.toLowerCase().includes(q)),
    );
  }, [faqs, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(totalFaqsCount / pageLimit));

  const handleOpenCreate = () => {
    setEditingFaq(null);
    setFormQuestion("");
    setFormAnswer("");
    setFormCategory("General");
    setFormOrderIndex(faqs.length + 1);
    setFormPublished(true);
    setFormError("");
    setShowFormModal(true);
  };

  const handleOpenEdit = (faq: FaqItemType) => {
    setEditingFaq(faq);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormCategory(faq.category || "General");
    setFormOrderIndex(faq.order_index ?? 0);
    setFormPublished(faq.is_published);
    setFormError("");
    setShowFormModal(true);
  };

  const handleSaveFaq = async () => {
    if (!formQuestion.trim()) {
      setFormError("Question (title) is required");
      return;
    }
    if (!formAnswer.trim()) {
      setFormError("Answer (description) is required");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const payload: CreateFaqData = {
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        category: formCategory.trim() || "General",
        order_index: Number(formOrderIndex) || 0,
        is_published: formPublished,
      };

      if (editingFaq) {
        await adminFaqService.updateFaq(editingFaq.id, payload);
        toast.success("FAQ updated successfully");
      } else {
        await adminFaqService.createFaq(payload);
        toast.success("FAQ created successfully");
      }

      setShowFormModal(false);
      await fetchFaqs();
    } catch (error: unknown) {
      console.error("Error saving FAQ:", error);
      const msg = error instanceof Error ? error.message : "Failed to save FAQ";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (faq: FaqItemType) => {
    try {
      setTogglingId(faq.id);
      const nextStatus = !faq.is_published;
      await adminFaqService.toggleFaqPublished(faq.id, nextStatus);
      toast.success(
        `FAQ is now ${nextStatus ? "published" : "hidden"} on storefront`,
      );
      await fetchFaqs();
    } catch (error) {
      console.error("Error toggling FAQ status:", error);
      toast.error("Failed to update FAQ status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteFaq = async () => {
    if (!faqToDelete) return;
    try {
      setDeletingId(faqToDelete.id);
      await adminFaqService.deleteFaq(faqToDelete.id);
      toast.success("FAQ deleted");
      setFaqToDelete(null);
      await fetchFaqs();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast.error("Failed to delete FAQ");
    } finally {
      setDeletingId(null);
    }
  };

  const columns: AdminDataTableColumn<FaqItemType>[] = useMemo(
    () => [
      {
        key: "question",
        header: "Question & Category",
        cellClassName: "max-w-[280px]",
        render: (item) => (
          <AdminEntityCell
            initials="Q"
            title={item.question}
            subtitle={item.category || "General"}
          />
        ),
      },
      {
        key: "answer",
        header: "Answer (Description)",
        cellClassName: "max-w-[340px]",
        render: (item) => (
          <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
            {item.answer}
          </p>
        ),
      },
      {
        key: "order",
        header: "Order",
        cellClassName: "w-16 text-center text-slate-600 dark:text-slate-300",
        render: (item) => (
          <span className="font-mono text-xs">{item.order_index ?? 0}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (item) => (
          <AdminStatusPill
            label={item.is_published ? "Published" : "Hidden"}
            tone={item.is_published ? "published" : "hidden"}
            styles={STATUS_STYLES}
            dots={STATUS_DOTS}
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
                  disabled={togglingId === item.id || deletingId === item.id}
                  className="text-muted-foreground hover:bg-muted inline-flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-50"
                  aria-label={`Actions for FAQ ${item.id}`}
                >
                  <MoreVertical className="size-4" />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleOpenEdit(item)}>
                  <Edit className="size-4" />
                  Edit FAQ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void handleTogglePublished(item)}>
                  {item.is_published ? (
                    <>
                      <EyeOff className="size-4" />
                      Hide from FAQ page
                    </>
                  ) : (
                    <>
                      <Eye className="size-4" />
                      Publish to FAQ page
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setFaqToDelete(item)}
                >
                  <Trash2 className="size-4" />
                  Delete FAQ
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [togglingId, deletingId],
  );

  if (loading && faqs.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQs Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create, edit, reorder, and hide/show customer FAQs displayed on the storefront.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="size-4" />
          Add New FAQ
        </Button>
      </div>

      <AdminTableToolbar
        searchPlaceholder="Search FAQs by question, answer, or category…"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Select
              value={filters.category || "all"}
              onValueChange={(val) => {
                const next = val ?? "all";
                setFilters((prev) => ({
                  ...prev,
                  category: next === "all" ? undefined : next,
                }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-10! w-full rounded-lg sm:w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {FAQ_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={
                filters.published === undefined
                  ? "all"
                  : filters.published
                    ? "published"
                    : "hidden"
              }
              onValueChange={(val) => {
                const next = val ?? "all";
                setFilters((prev) => ({
                  ...prev,
                  published:
                    next === "all" ? undefined : next === "published",
                }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-10! w-full rounded-lg sm:w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <AdminDataTable
        columns={columns}
        data={filteredFaqs}
        getRowKey={(item) => item.id}
        emptyIcon={<HelpCircle className="size-10 opacity-40" />}
        emptyTitle="No FAQs found"
        isLoading={loading}
      />

      <AdminTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalFaqsCount}
        visibleCount={filteredFaqs.length}
        onPageChange={setCurrentPage}
        isLoading={loading}
      />

      {/* Wide Popup Modal for Adding/Editing FAQ */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingFaq ? "Edit FAQ" : "Add New FAQ"}
            </DialogTitle>
            <DialogDescription>
              Add or update the question title and description for customers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-3">
            {formError && (
              <div className="bg-destructive/10 text-destructive rounded-lg border border-destructive/20 p-3 text-sm">
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="faq-question">Question (Title) *</Label>
              <Input
                id="faq-question"
                value={formQuestion}
                onChange={(e) => setFormQuestion(e.target.value)}
                placeholder="e.g. What is the delivery time?"
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="faq-answer">Answer (Description) *</Label>
              <Textarea
                id="faq-answer"
                value={formAnswer}
                onChange={(e) => setFormAnswer(e.target.value)}
                placeholder="Provide a clear, detailed answer for customers..."
                rows={6}
                className="min-h-35 text-sm leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="faq-category">Category</Label>
                <Input
                  id="faq-category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. Shipping, Payment, General"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faq-order">Display Order Index</Label>
                <Input
                  id="faq-order"
                  type="number"
                  value={formOrderIndex}
                  onChange={(e) => setFormOrderIndex(Number(e.target.value))}
                  placeholder="0"
                  className="h-10"
                />
              </div>
            </div>

            <div className="bg-muted/40 flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="faq-visible" className="text-base font-medium">
                  Visible on FAQ page
                </Label>
                <p className="text-muted-foreground text-xs">
                  When enabled, this FAQ is published and visible on the public FAQ page.
                </p>
              </div>
              <Switch
                id="faq-visible"
                checked={formPublished}
                onCheckedChange={setFormPublished}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowFormModal(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveFaq} disabled={saving}>
              {saving ? "Saving..." : editingFaq ? "Save Changes" : "Create FAQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(faqToDelete)}
        onClose={() => setFaqToDelete(null)}
        onConfirm={handleDeleteFaq}
        title="Delete FAQ"
        description={
          faqToDelete
            ? `Are you sure you want to delete the FAQ "${faqToDelete.question}"? This cannot be undone.`
            : "Delete this FAQ? This cannot be undone."
        }
        loading={deletingId !== null}
      />
    </div>
  );
}
