import { Suspense } from "react";
import { CategoryPageLoader } from "@/components/CategoryPageLoader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  breadcrumbJsonLd,
  categoryMetadata,
  JsonLd,
} from "@/lib/seo";

export const metadata = categoryMetadata("Shoes", "shoes");
export const revalidate = 60;

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
        <CategoryPageLoader categoryName="Shoes" categoryId={3} />
      </Suspense>
    </>
  );
}
