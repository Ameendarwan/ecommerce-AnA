import { productServerService } from "@/services/product/productServerService";
import CategoryPage from "@/components/CategoryPage";

interface CategoryPageLoaderProps {
  categoryName: string;
  categoryId: number;
}

export async function CategoryPageLoader({
  categoryName,
  categoryId,
}: CategoryPageLoaderProps) {
  const products =
    await productServerService.getProductsByCategory(categoryId);

  return (
    <CategoryPage
      categoryName={categoryName}
      categoryId={categoryId}
      initialProducts={products}
    />
  );
}
