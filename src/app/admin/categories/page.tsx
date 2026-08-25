"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  FolderOpen,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  adminCategoryService,
  CreateCategoryData,
} from "@/services/admin/adminCategoryService";
import { CategoryType } from "@/types";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateStorefrontCatalog } from "@/lib/cache/invalidateStorefrontCatalog";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(
    null,
  );
  const [deletingCategory, setDeletingCategory] =
    useState<CategoryType | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formVisible, setFormVisible] = useState(true);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    void fetchCategories();
  }, []);

  const syncStorefront = () => {
    void invalidateStorefrontCatalog(queryClient);
  };

  const fetchCategories = async ({
    silent = false,
  }: { silent?: boolean } = {}) => {
    try {
      if (!silent) setInitialLoading(true);
      const data = await adminCategoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      if (!silent) setInitialLoading(false);
    }
  };

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
      await fetchCategories({ silent: true });
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

  const handleDeleteCategory = async (id: number) => {
    try {
      setDeleting(true);
      await adminCategoryService.deleteCategory(id);
      toast.success("Category deleted");
      setDeletingCategory(null);
      setCategories((prev) => prev.filter((category) => category.id !== id));
      syncStorefront();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete category. It may still have products.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Category Management
          </h1>
          <p className="text-muted-foreground">
            Show or hide categories in the storefront sidebar
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => {
          const visible = category.is_visible ?? true;
          return (
            <Card key={category.id}>
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <Badge variant={visible ? "secondary" : "outline"}>
                    {visible ? (
                      <>
                        <Eye className="mr-1 h-3 w-3" />
                        Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="mr-1 h-3 w-3" />
                        Hidden
                      </>
                    )}
                  </Badge>
                </div>
                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {category.description || "No description"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">Show in sidebar</p>
                    <p className="text-muted-foreground text-xs">
                      Controls storefront navigation
                    </p>
                  </div>
                  <Switch
                    checked={visible}
                    disabled={togglingId === category.id}
                    onCheckedChange={() => void handleToggleVisibility(category)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditModal(category)}
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setDeletingCategory(category)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="text-muted-foreground mb-2 text-lg font-medium">
              No categories found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search terms."
                : "Create your first category to organize products."}
            </p>
            {!searchTerm && (
              <Button onClick={openCreateModal}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            )}
          </CardContent>
        </Card>
      )}

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
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => handleDeleteCategory(deletingCategory!.id)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deletingCategory?.name}"? This cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
