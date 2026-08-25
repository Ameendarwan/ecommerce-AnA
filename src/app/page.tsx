import { Suspense } from "react";
import ClientProducts from "@/components/ClientProducts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  JsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

export default function Home() {
  return (
    <ErrorBoundary>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <div className="bg-background min-h-screen">
        <div className="px-6">
          <div className="space-y-4 py-4">
            <Suspense
              fallback={
                <div className="flex min-h-[200px] items-center justify-center">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-t-2 border-b-2"></div>
                </div>
              }
            >
              <ClientProducts />
            </Suspense>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
