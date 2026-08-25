import { Suspense } from "react";
import CategoryPage from "@/components/CategoryPage";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  breadcrumbJsonLd,
  categoryMetadata,
  JsonLd,
} from "@/lib/seo";

export const metadata = categoryMetadata("Bags", "bags");

export default function BagsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Bags", path: "/bags" },
        ])}
      />
      <Suspense fallback={<LoadingSpinner />}>
        <CategoryPage categoryName="Bags" categoryId={2} />
      </Suspense>
    </>
  );
}
