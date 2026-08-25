import { Suspense } from "react";
import CategoryPage from "@/components/CategoryPage";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  breadcrumbJsonLd,
  categoryMetadata,
  JsonLd,
} from "@/lib/seo";

export const metadata = categoryMetadata("Shirts", "shirts");

export default function ShirtsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shirts", path: "/shirts" },
        ])}
      />
      <Suspense fallback={<LoadingSpinner />}>
        <CategoryPage categoryName="Shirts" categoryId={1} />
      </Suspense>
    </>
  );
}
