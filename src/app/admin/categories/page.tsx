"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Edit,
  Eye,
  EyeOff,
  FolderOpen,
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
import {
  AdminDataTable,
  AdminEntityCell,
  AdminStatusPill,
  AdminTablePagination,
  AdminTableToolbar,
  type AdminDataTableColumn,
} from "@/components/admin/table";
import {
  adminCategoryService,
  CategoryFilters,
  CreateCategoryData,
} from "@/services/admin/adminCategoryService";
import { CategoryType } from "@/types";
import { invalidateStorefrontCatalog } from "@/lib/cache/invalidateStorefrontCatalog";

const VISIBILITY_OPTIONS = [
  { value: "all", label: "All Visibility" },
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
] as const;

const VISIBILITY_STYLES: Record<string, string> = {
  visible: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  hidden: "bg-slate-50 text-slate-600 ring-slate-200",
};

const VISIBILITY_DOTS: Record<string, string> = {
  visible: "bg-emerald-500",
  hidden: "bg-slate-400",
};

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<CategoryFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(
    null,
  );
  const [categoryToDelete, setCategoryToDelete] =
    useState<CategoryType | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formVisible, setFormVisible] = useState(true);
  const [formError, setFormError] = useState("");
  const pageLimit = 10;

  const syncStorefront = () => {
    void invalidateStorefrontCatalog(queryClient);
  };

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminCategoryService.getAllCategories(
        filters,
        currentPage,
        pageLimit,
      );
      setCategories(data.categories);
      setTotalCategories(data.total);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const q = searchTerm.toLowerCase();
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(q) ||
        category.description?.toLowerCase().includes(q),
    );
  }, [categories, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(totalCategories / pageLimit));

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormDescription("");
    setFormVisible(true);
    setFormError("");
    setShowFormModal(true);
  };

  const openEditModal = (category: CategoryType) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormDescription(category.description || "");
    setFormVisible(category.is_visible ?? true);
    setFormError("");
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingCategory(null);
    setFormError("");
  };

  const handleSaveCategory = async () => {
    if (!formName.trim()) {
      setFormError("Name is required");
      return;
    }

    setSaving(true);
    try {
      const payload: CreateCategoryData = {
        name: formName.trim(),
        description: formDescription.trim(),
        is_visible: formVisible,
      };

      if (editingCategory) {
        await adminCategoryService.updateCategory(editingCategory.id, payload);
        toast.success("Category updated");
      } else {
        await adminCategoryService.createCategory(payload);
        toast.success("Category created");
      }

      closeFormModal();
      await fetchCategories();
      syncStorefront();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save category",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (category: CategoryType) => {
    const nextVisible = !(category.is_visible ?? true);
    setTogglingId(category.id);
    setCategories((prev) =>
      prev.map((item) =>
        item.id === category.id ? { ...item, is_visible: nextVisible } : item,
      ),
    );

    try {
      await adminCategoryService.updateCategory(category.id, {
        is_visible: nextVisible,
      });
      toast.success(
        nextVisible
          ? `"${category.name}" is now visible`
          : `"${category.name}" is now hidden`,
      );
      syncStorefront();
    } catch (error) {
      console.error("Error toggling category:", error);
      setCategories((prev) =>
        prev.map((item) =>
          item.id === category.id
            ? { ...item, is_visible: category.is_visible ?? true }
            : item,
        ),
      );
      toast.error("Failed to update visibility");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      setDeletingId(categoryToDelete.id);
      await adminCategoryService.deleteCategory(categoryToDelete.id);
      toast.success("Category deleted");
      setCategoryToDelete(null);
      await fetchCategories();
      syncStorefront();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete category. It may still have products.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const columns: AdminDataTableColumn<CategoryType>[] = useMemo(
    () => [
      {
        key: "category",
        header: "Category",
        cellClassName: "max-w-[220px]",
        render: (category) => {
          const initials = category.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <AdminEntityCell
              initials={initials}
              title={category.name}
              subtitle={`ID #${category.id}`}
            />
          );
        },
      },
      {
        key: "description",
        header: "Description",
        cellClassName: "max-w-[280px]",
        render: (category) => (
          <p className="line-clamp-2 text-sm text-slate-600">
            {category.description?.trim() || "—"}
          </p>
        ),
      },
      {
        key: "visibility",
        header: "Visibility",
        render: (category) => {
          const isVisible = category.is_visible ?? true;
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
        key: "actions",
        header: "Actions",
        headerClassName: "w-12 text-right",
        cellClassName: "text-right",
        render: (category) => {
          const isBusy =
            togglingId === category.id || deletingId === category.id;
          const isVisible = category.is_visible ?? true;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    disabled={isBusy}
                    className="text-muted-foreground hover:bg-muted inline-flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-50"
                    aria-label={`Actions for ${category.name}`}
                  >
                    <MoreVertical className="size-4" />
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => openEditModal(category)}>
                    <Edit className="size-4" />
                    Edit category
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => void handleToggleVisibility(category)}
                  >
                    {isVisible ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                    {isVisible ? "Hide category" : "Show category"}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setCategoryToDelete(category)}
                  >
                    <Trash2 className="size-4" />
                    Delete category
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [togglingId, deletingId],
  );

  if (loading && categories.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Category Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Browse, filter, and manage storefront categories.
          </p>
        </div>
        <Button onClick={openCreateModal} className="cursor-pointer">
          <Plus className="mr-2 size-4" />
          Add Category
        </Button>
      </div>

      <AdminTableToolbar
        searchPlaceholder="Search by name or description…"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={
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
              setFilters({
                isVisible:
                  next === "all"
                    ? undefined
                    : next === "visible"
                      ? true
                      : false,
              });
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
        }
      />

      <AdminDataTable
        columns={columns}
        data={filteredCategories}
        getRowKey={(category) => category.id}
        emptyIcon={<FolderOpen className="size-10 opacity-40" />}
        emptyTitle="No categories found"
        isLoading={loading}
      />

      <AdminTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalCategories}
        visibleCount={filteredCategories.length}
        onPageChange={setCurrentPage}
        isLoading={loading}
      />

      <Dialog open={showFormModal} onOpenChange={closeFormModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              Categories appear in the storefront sidebar when visible.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="category-name">Name *</Label>
              <Input
                id="category-name"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (formError) setFormError("");
                }}
                placeholder="e.g. Shirts"
              />
              {formError && (
                <p className="text-destructive text-sm">{formError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category-description">Description</Label>
              <textarea
                id="category-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                placeholder="Optional"
                className="border-input bg-background placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:outline-none focus-visible:ring-0"
              />
            </div>

            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <Label htmlFor="category-visible">Show category</Label>
                <p className="text-muted-foreground text-xs">
                  Hidden categories disappear from the sidebar
                </p>
              </div>
              <Switch
                id="category-visible"
                checked={formVisible}
                onCheckedChange={setFormVisible}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={closeFormModal}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleSaveCategory()}
              disabled={saving}
            >
              {saving ? "Saving…" : editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        description={
          categoryToDelete
            ? `Are you sure you want to delete "${categoryToDelete.name}"? This cannot be undone.`
            : "Delete this category? This cannot be undone."
        }
        loading={deletingId !== null}
      />
    </div>
  );
}
