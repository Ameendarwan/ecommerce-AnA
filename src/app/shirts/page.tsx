import { Suspense } from "react";
import { CategoryPageLoader } from "@/components/CategoryPageLoader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  breadcrumbJsonLd,
  categoryMetadata,
  JsonLd,
} from "@/lib/seo";

export const metadata = categoryMetadata("Shirts", "shirts");
export const revalidate = 60;

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
        <CategoryPageLoader categoryName="Shirts" categoryId={1} />
      </Suspense>
    </>
  );
}
