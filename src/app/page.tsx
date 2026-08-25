import { Suspense } from "react";
import ClientProducts from "@/components/ClientProducts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { productServerService } from "@/services/product/productServerService";
import {
  getPrimaryProductImage,
  LcpImagePreload,
} from "@/components/LcpImagePreload";

export const revalidate = 60;

export default async function Home() {
  const products = await productServerService.getProducts();
  const lcpImage = products[0] ? getPrimaryProductImage(products[0]) : null;

  return (
    <ErrorBoundary>
      <LcpImagePreload src={lcpImage} />
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <div className="space-y-4 py-4">
        <Suspense
          fallback={
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-t-2 border-b-2"></div>
            </div>
          }
        >
          <ClientProducts initialProducts={products} />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
