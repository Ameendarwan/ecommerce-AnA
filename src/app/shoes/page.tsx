import { Suspense } from "react";
import CategoryPage from "@/components/CategoryPage";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  breadcrumbJsonLd,
  categoryMetadata,
  JsonLd,
} from "@/lib/seo";

export const metadata = categoryMetadata("Shoes", "shoes");

export default function ShoesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shoes", path: "/shoes" },
        ])}
      />
      <Suspense fallback={<LoadingSpinner />}>
        <CategoryPage categoryName="Shoes" categoryId={3} />
      </Suspense>
    </>
  );
}
