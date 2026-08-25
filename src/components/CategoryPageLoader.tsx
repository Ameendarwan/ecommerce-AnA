import { productServerService } from "@/services/product/productServerService";
import CategoryPage from "@/components/CategoryPage";
import {
  getPrimaryProductImage,
  LcpImagePreload,
} from "@/components/LcpImagePreload";

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
  const lcpImage = products[0] ? getPrimaryProductImage(products[0]) : null;

  return (
    <>
      <LcpImagePreload src={lcpImage} />
      <CategoryPage
      categoryName={categoryName}
      categoryId={categoryId}
      initialProducts={products}
    />
    </>
  );
}
