import { Suspense } from "react";
import ClientProducts from "@/components/ClientProducts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { productServerService } from "@/services/product/productServerService";

export const revalidate = 60;

export default async function Home() {
  const products = await productServerService.getProducts();

  return (
    <ErrorBoundary>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <div className="bg-background min-h-screen">
        <div className="px-4">
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
        </div>
      </div>
    </ErrorBoundary>
  );
}
