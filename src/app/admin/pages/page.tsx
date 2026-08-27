"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Edit,
  Eye,
  EyeOff,
  FileText,
  Globe,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  AdminDataTable,
  AdminEntityCell,
  AdminStatusPill,
  AdminTablePagination,
  AdminTableToolbar,
  type AdminDataTableColumn,
} from "@/components/admin/table";
import {
  adminPageService,
  PageFilters,
  CreatePageData,
} from "@/services/admin/adminPageService";
import { PageType } from "@/types";
import { pagesKeys } from "@/hooks/queries/use-pages";

const STANDARD_PAGE_SLUGS = [
  "about",
  "privacy",
  "shipping-policy",
  "payment-options",
  "returns",
  "size-chart",
];

function getLivePageUrl(slug: string) {
  return STANDARD_PAGE_SLUGS.includes(slug) ? `/${slug}` : `/p/${slug}`;
}

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

export default function AdminPagesPage() {
  const queryClient = useQueryClient();
  const [pages, setPages] = useState<PageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<PageFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPagesCount, setTotalPagesCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPage, setEditingPage] = useState<PageType | null>(null);
  const [pageToDelete, setPageToDelete] = useState<PageType | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formPublished, setFormPublished] = useState(true);
  const [formSeoTitle, setFormSeoTitle] = useState("");
  const [formSeoDescription, setFormSeoDescription] = useState("");
  const [formError, setFormError] = useState("");

  const pageLimit = 10;

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminPageService.getAllPages(
        filters,
        currentPage,
        pageLimit,
      );
      setPages(data.pages);
      setTotalPagesCount(data.total);
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    void fetchPages();
  }, [fetchPages]);

  const filteredPages = useMemo(() => {
    if (!searchTerm.trim()) return pages;
    const q = searchTerm.toLowerCase();
    return pages.filter(
      (page) =>
        page.title.toLowerCase().includes(q) ||
        page.slug.toLowerCase().includes(q) ||
        (page.seo_description && page.seo_description.toLowerCase().includes(q)),
    );
  }, [pages, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(totalPagesCount / pageLimit));

  const handleOpenCreate = () => {
    setEditingPage(null);
    setFormTitle("");
    setFormSlug("");
    setFormContent("");
    setFormPublished(true);
    setFormSeoTitle("");
    setFormSeoDescription("");
    setFormError("");
    setShowFormModal(true);
  };

  const handleOpenEdit = (page: PageType) => {
    setEditingPage(page);
    setFormTitle(page.title);
    setFormSlug(page.slug);
    setFormContent(page.content || "");
    setFormPublished(page.is_published);
    setFormSeoTitle(page.seo_title || "");
    setFormSeoDescription(page.seo_description || "");
    setFormError("");
    setShowFormModal(true);
  };

  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingPage) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormSlug(generatedSlug);
    }
  };

  const handleSavePage = async () => {
    if (!formTitle.trim()) {
      setFormError("Title is required");
      return;
    }
    if (!formSlug.trim()) {
      setFormError("Slug is required");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const payload: CreatePageData = {
        title: formTitle.trim(),
        slug: formSlug.trim().toLowerCase(),
        content: formContent,
        is_published: formPublished,
        seo_title: formSeoTitle.trim() || undefined,
        seo_description: formSeoDescription.trim() || undefined,
      };

      if (editingPage) {
        await adminPageService.updatePage(editingPage.id, payload);
        toast.success(`Page "${formTitle}" updated successfully`);
      } else {
        await adminPageService.createPage(payload);
        toast.success(`Page "${formTitle}" created successfully`);
      }

      void queryClient.invalidateQueries({ queryKey: pagesKeys.all });
      setShowFormModal(false);
      await fetchPages();
    } catch (error: unknown) {
      console.error("Error saving page:", error);
      const msg = error instanceof Error ? error.message : "Failed to save page";
      if (msg.includes("duplicate") || msg.includes("unique")) {
        setFormError("A page with this URL slug already exists.");
      } else {
        setFormError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (page: PageType) => {
    try {
      setTogglingId(page.id);
      const nextStatus = !page.is_published;
      await adminPageService.togglePagePublished(page.id, nextStatus);
      void queryClient.invalidateQueries({ queryKey: pagesKeys.all });
      toast.success(
        `Page "${page.title}" is now ${nextStatus ? "published" : "hidden"}`,
      );
      await fetchPages();
    } catch (error) {
      console.error("Error toggling page status:", error);
      toast.error("Failed to update page status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeletePage = async () => {
    if (!pageToDelete) return;
    try {
      setDeletingId(pageToDelete.id);
      await adminPageService.deletePage(pageToDelete.id);
      void queryClient.invalidateQueries({ queryKey: pagesKeys.all });
      toast.success(`Page "${pageToDelete.title}" deleted`);
      setPageToDelete(null);
      await fetchPages();
    } catch (error) {
      console.error("Error deleting page:", error);
      toast.error("Failed to delete page");
    } finally {
      setDeletingId(null);
    }
  };

  const columns: AdminDataTableColumn<PageType>[] = useMemo(
    () => [
      {
        key: "page",
        header: "Page Title & URL",
        render: (item) => (
          <AdminEntityCell
            initials={item.title.slice(0, 2).toUpperCase()}
            title={item.title}
            subtitle={getLivePageUrl(item.slug)}
          />
        ),
      },
      {
        key: "seo",
        header: "SEO Description",
        cellClassName: "max-w-[260px]",
        render: (item) => (
          <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
            {item.seo_description || "—"}
          </p>
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
        header: "Last Updated",
        cellClassName: "text-slate-600 whitespace-nowrap dark:text-slate-300",
        render: (item) =>
          item.updated_at || item.created_at
            ? format(new Date(item.updated_at || item.created_at!), "MMM dd, yyyy")
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
                  aria-label={`Actions for page ${item.title}`}
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
                  Edit Page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void handleTogglePublished(item)}>
                  {item.is_published ? (
                    <>
                      <EyeOff className="size-4" />
                      Hide from store
                    </>
                  ) : (
                    <>
                      <Eye className="size-4" />
                      Publish to store
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => window.open(getLivePageUrl(item.slug), "_blank")}
                >
                  <Globe className="size-4" />
                  View Live
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setPageToDelete(item)}
                >
                  <Trash2 className="size-4" />
                  Delete Page
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [togglingId, deletingId],
  );

  if (loading && pages.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pages Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create, edit, format content with rich text, or hide/show store content pages.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="size-4" />
          Add New Page
        </Button>
      </div>

      <AdminTableToolbar
        searchPlaceholder="Search pages by title, URL slug, or SEO description…"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={
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
            <SelectTrigger className="h-10! w-full rounded-lg sm:w-44">
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
        }
      />

      <AdminDataTable
        columns={columns}
        data={filteredPages}
        getRowKey={(item) => item.id}
        emptyIcon={<FileText className="size-10 opacity-40" />}
        emptyTitle="No pages found"
        isLoading={loading}
      />

      <AdminTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalPagesCount}
        visibleCount={filteredPages.length}
        onPageChange={setCurrentPage}
        isLoading={loading}
      />

      {/* Edit / Create Page Modal with Rich Text Editor */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-h-[92vh] w-[95vw] max-w-5xl overflow-y-auto sm:max-w-6xl">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl sm:text-2xl">
              {editingPage ? `Edit Page: ${editingPage.title}` : "Add New Page"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Update the page title, URL slug, visibility, and formatted rich content.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {formError && (
              <div className="bg-destructive/10 text-destructive rounded-lg border border-destructive/20 p-3.5 text-sm font-medium">
                {formError}
              </div>
            )}

            {/* Title & Slug */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="page-title" className="font-medium">
                  Page Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="page-title"
                  value={formTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Terms of Service"
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="page-slug" className="font-medium">
                  URL Slug <span className="text-destructive">*</span>
                </Label>
                <div className="relative flex items-center">
                  <span className="text-muted-foreground absolute left-3.5 text-sm font-medium">
                    /
                  </span>
                  <Input
                    id="page-slug"
                    value={formSlug}
                    onChange={(e) =>
                      setFormSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-_]/g, ""),
                      )
                    }
                    placeholder="terms-of-service"
                    className="h-11 pl-8 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Page Content (Rich Text Editor)</Label>
                <span className="text-muted-foreground text-xs">
                  Supports headings, lists, links, quotes, and HTML code mode
                </span>
              </div>
              <RichTextEditor
                value={formContent}
                onChange={setFormContent}
                placeholder="Write formatted page content with headings, paragraphs, bullet points, links, and styling..."
                minHeight="min-h-[380px]"
              />
            </div>

            {/* SEO & Meta */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="page-seo-title" className="font-medium">
                  SEO Meta Title
                </Label>
                <Input
                  id="page-seo-title"
                  value={formSeoTitle}
                  onChange={(e) => setFormSeoTitle(e.target.value)}
                  placeholder="Custom title for Google & search engines"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="page-seo-desc" className="font-medium">
                  SEO Meta Description
                </Label>
                <Input
                  id="page-seo-desc"
                  value={formSeoDescription}
                  onChange={(e) => setFormSeoDescription(e.target.value)}
                  placeholder="Short description shown in search results"
                  className="h-10"
                />
              </div>
            </div>

            {/* Publish Toggle */}
            <div className="bg-muted/30 flex items-center justify-between rounded-xl border p-4.5">
              <div className="space-y-0.5">
                <Label htmlFor="page-visible" className="text-base font-semibold">
                  Publish Page to Store
                </Label>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  When enabled, this page is publicly live and automatically listed under Information in the footer.
                </p>
              </div>
              <Switch
                id="page-visible"
                checked={formPublished}
                onCheckedChange={setFormPublished}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 border-t pt-4 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowFormModal(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePage} disabled={saving} className="px-6">
              {saving ? "Saving..." : editingPage ? "Save Changes" : "Create Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(pageToDelete)}
        onClose={() => setPageToDelete(null)}
        onConfirm={handleDeletePage}
        title="Delete Page"
        description={
          pageToDelete
            ? `Are you sure you want to delete "${pageToDelete.title}" (/${pageToDelete.slug})? This cannot be undone.`
            : "Delete this page? This cannot be undone."
        }
        loading={deletingId !== null}
      />
    </div>
  );
}
