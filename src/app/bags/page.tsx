import { Suspense } from "react";
import { CategoryPageLoader } from "@/components/CategoryPageLoader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  breadcrumbJsonLd,
  categoryMetadata,
  JsonLd,
} from "@/lib/seo";

export const metadata = categoryMetadata("Bags", "bags");
export const revalidate = 60;

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
        <CategoryPageLoader categoryName="Bags" categoryId={2} />
      </Suspense>
    </>
  );
}
