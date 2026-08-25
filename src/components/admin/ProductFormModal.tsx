"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CreateProductData,
  ProductWithDetails,
} from "@/services/admin/adminProductService";
import { adminCategoryService } from "@/services/admin/adminCategoryService";
import { CategoryType, ProductBadge } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadProductImages } from "@/lib/uploadProductImages";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductData) => Promise<void>;
  product?: ProductWithDetails | null;
  title: string;
}

interface FormData {
  title: string;
  description: string;
  price: string;
  stock: string;
  sku: string;
  category_id: string;
  is_visible: boolean;
  show_sale_tag: boolean;
  show_badge: boolean;
  discount_percent: string;
  badge: ProductBadge;
}

interface PreviewItem {
  id: string;
  url: string;
  file?: File;
  existing?: boolean;
}

const defaultFormData: FormData = {
  title: "",
  description: "",
  price: "",
  stock: "1",
  sku: "",
  category_id: "no-category",
  is_visible: true,
  show_sale_tag: false,
  show_badge: false,
  discount_percent: "0",
  badge: "used",
};

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  title,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const data = await adminCategoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategoriesError(
        error instanceof Error ? error.message : "Failed to load categories",
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        stock: product.stock?.toString() || "1",
        sku: product.sku || "",
        category_id: product.category_id?.toString() || "no-category",
        is_visible: product.is_visible ?? true,
        show_sale_tag: product.show_sale_tag ?? false,
        show_badge: product.show_badge ?? true,
        discount_percent: String(product.discount_percent ?? 0),
        badge: product.badge === "new" ? "new" : "used",
      });
      const existingImages =
        product.images && product.images.length > 0
          ? product.images
          : product.image
            ? [product.image]
            : [];
      setPreviews(
        existingImages.map((url, i) => ({
          id: `existing-${i}-${url}`,
          url,
          existing: true,
        })),
      );
    } else {
      setFormData(defaultFormData);
      setPreviews([]);
    }
    setErrors({});
  }, [product, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";

    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = "Enter a valid PKR amount";
      }
    }

    if (!formData.stock.trim()) {
      newErrors.stock = "Stock is required";
    } else {
      const stock = parseInt(formData.stock, 10);
      if (isNaN(stock) || stock < 0) {
        newErrors.stock = "Stock must be 0 or more";
      }
    }

    if (formData.discount_percent.trim()) {
      const discount = parseInt(formData.discount_percent, 10);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        newErrors.discount_percent = "Discount must be between 0 and 100";
      }
    }

    if (previews.length === 0) {
      newErrors.images = "Add at least one product photo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files?.length) return;

    const next: PreviewItem[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} must be under 5MB`);
        return;
      }
      next.push({
        id: `new-${file.name}-${file.size}-${Date.now()}`,
        url: URL.createObjectURL(file),
        file,
      });
    });

    setPreviews((prev) => [...prev, ...next].slice(0, 8));
    if (errors.images) setErrors((e) => ({ ...e, images: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePreview = (id: string) => {
    setPreviews((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item?.file) URL.revokeObjectURL(item.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const existingUrls = previews
        .filter((p) => p.existing)
        .map((p) => p.url);
      const newFiles = previews
        .filter((p) => p.file)
        .map((p) => p.file!) as File[];

      const uploaded = await uploadProductImages(
        newFiles,
        product?.product_id,
      );
      const allImages = [...existingUrls, ...uploaded];

      const submitData: CreateProductData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        image: allImages[0],
        images: allImages,
        stock: parseInt(formData.stock, 10),
        sku: formData.sku.trim() || undefined,
        category_id:
          formData.category_id && formData.category_id !== "no-category"
            ? parseInt(formData.category_id, 10)
            : undefined,
        is_visible: formData.is_visible,
        show_sale_tag: formData.show_sale_tag,
        show_badge: formData.show_badge,
        discount_percent: Math.min(
          100,
          Math.max(0, parseInt(formData.discount_percent || "0", 10) || 0),
        ),
        badge: formData.badge,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save product",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {product
              ? "Update this used item listing"
              : "Add a used item (usually stock 1)"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g. Used denim shirt — Medium"
            />
            {errors.title && (
              <p className="text-destructive text-sm">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                handleInputChange("description", e.target.value)
              }
              placeholder="Condition, size, wear notes…"
              rows={3}
              className="border-input bg-background placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:outline-none focus-visible:ring-0"
            />
            {errors.description && (
              <p className="text-destructive text-sm">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (PKR) *</Label>
              <Input
                id="price"
                type="number"
                step="1"
                min="1"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="2500"
              />
              {errors.price && (
                <p className="text-destructive text-sm">{errors.price}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="discount_percent">Discount (%)</Label>
              <Input
                id="discount_percent"
                type="number"
                min="0"
                max="100"
                step="1"
                value={formData.discount_percent}
                onChange={(e) =>
                  handleInputChange("discount_percent", e.target.value)
                }
                placeholder="e.g. 30"
              />
              {errors.discount_percent && (
                <p className="text-destructive text-sm">
                  {errors.discount_percent}
                </p>
              )}
              <p className="text-muted-foreground text-xs">
                Shows strikethrough price and “X% OFF” on the storefront
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                placeholder="1"
              />
              {errors.stock && (
                <p className="text-destructive text-sm">{errors.stock}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            {categoriesError && (
              <div className="border-destructive/30 bg-destructive/10 mb-1 space-y-2 rounded-md border p-2 text-sm">
                <p className="text-destructive">{categoriesError}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void fetchCategories()}
                >
                  Retry
                </Button>
              </div>
            )}
            <Select
              value={formData.category_id}
              onValueChange={(value) =>
                handleInputChange("category_id", value ?? "no-category")
              }
              disabled={categoriesLoading || !!categoriesError}
              modal={false}
              items={[
                { label: "No category", value: "no-category" },
                ...categories.map((category) => ({
                  value: category.id.toString(),
                  label:
                    category.is_visible === false
                      ? `${category.name} (hidden)`
                      : category.name,
                })),
              ]}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectItem value="no-category">No category</SelectItem>
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id.toString()}
                  >
                    {category.name}
                    {category.is_visible === false ? " (hidden)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 rounded-md border p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor="is_visible">Show product</Label>
                <p className="text-muted-foreground text-xs">
                  Hidden products stay off the storefront
                </p>
              </div>
              <Switch
                id="is_visible"
                checked={formData.is_visible}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_visible: checked }))
                }
              />
            </div>

            <div className="border-border border-t pt-3">
              <p className="mb-3 text-sm font-medium">Badges</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label htmlFor="show_sale_tag">Sale tag</Label>
                    <p className="text-muted-foreground text-xs">
                      Show a Sale badge on the product image
                    </p>
                  </div>
                  <Switch
                    id="show_sale_tag"
                    checked={formData.show_sale_tag}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        show_sale_tag: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label htmlFor="show_badge">New/Used badge</Label>
                    <p className="text-muted-foreground text-xs">
                      Show the condition badge on the storefront
                    </p>
                  </div>
                  <Switch
                    id="show_badge"
                    checked={formData.show_badge}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, show_badge: checked }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="badge">Badge type</Label>
                  <Select
                    value={formData.badge}
                    onValueChange={(value) => {
                      if (value !== "new" && value !== "used") return;
                      setFormData((prev) => ({ ...prev, badge: value }));
                    }}
                    items={[
                      { label: "New", value: "new" },
                      { label: "Used", value: "used" },
                    ]}
                    modal={false}
                    disabled={!formData.show_badge}
                  >
                    <SelectTrigger id="badge" className="w-full">
                      <SelectValue placeholder="Select badge" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photos * (up to 8)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {previews.map((item) => (
                <div
                  key={item.id}
                  className="bg-muted relative aspect-square overflow-hidden rounded-md border"
                >
                  <Image
                    src={item.url}
                    alt="Product"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removePreview(item.id)}
                    className="bg-background/90 absolute top-1 right-1 rounded-full p-1 shadow"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {previews.length < 8 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs"
                >
                  <ImagePlus className="h-5 w-5" />
                  Add
                </button>
              )}
            </div>
            {errors.images && (
              <p className="text-destructive text-sm">{errors.images}</p>
            )}
            <p className="text-muted-foreground text-xs">
              Stored in Supabase Storage. First photo is the cover. Max 5MB each.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : product ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
