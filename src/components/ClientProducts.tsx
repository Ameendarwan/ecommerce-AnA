"use client";

import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { useProducts, FilterOptions } from "@/hooks/queries";
import { ProductType } from "@/types";
import { ErrorState } from "@/components/ErrorState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BrandLoader } from "@/components/BrandLoader";
import { useState, useMemo, useEffect } from "react";

// Helper functions (moved from hook to component for simplicity)
const sortProducts = (
  products: ProductType[],
  sortBy: FilterOptions["sortBy"],
) => {
  const sorted = [...products];

  switch (sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "name-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "name-desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return sorted;
  }
};

const filterProducts = (products: ProductType[], filters: FilterOptions) => {
  let filtered = [...products];

  if (filters.stockFilter === "in-stock") {
    filtered = filtered.filter((product) => product.stock > 0);
  } else if (filters.stockFilter === "out-of-stock") {
    filtered = filtered.filter((product) => product.stock === 0);
  }

  if (filters.categoryFilter !== "all") {
    filtered = filtered.filter(
      (product) => product.category_id === filters.categoryFilter,
    );
  }

  return filtered;
};

export default function ClientProducts({
  initialProducts,
}: {
  initialProducts?: ProductType[];
}) {
  const {
    data: products = [],
    isLoading: loading,
    error,
    refetch: retry,
  } = useProducts({ initialData: initialProducts });
  // const { data: categories = [] } = useCategories();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: "default",
    stockFilter: "all",
    categoryFilter: "all",
  });
  // searchTerm / filters kept so re-enabling search UI is a comment flip

  const BATCH_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [observerTarget, setObserverTarget] = useState<HTMLDivElement | null>(
    null,
  );

  // Process products with search, filters, and sorting
  const processedProducts = useMemo(() => {
    if (!products) return [];

    // Start with all products
    let processed = [...products];

    // Apply search filter
    if (searchTerm.trim() !== "") {
      processed = processed.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description?.toLowerCase() || "").includes(
            searchTerm.toLowerCase(),
          ),
      );
    }

    // Apply filters
    processed = filterProducts(processed, filters);

    // Apply sorting
    processed = sortProducts(processed, filters.sortBy);

    return processed;
  }, [products, searchTerm, filters]);

  const hasMore = visibleCount < processedProducts.length;

  // Reset pagination on filter or search changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [searchTerm, filters]);

  // Trigger the next batch before the user reaches the last loaded cards.
  // Mobile cards are ~viewport tall, so a 500px margin sat behind 3 stacked
  // placeholders and felt like the 3rd empty product had to be reached first.
  useEffect(() => {
    if (!observerTarget || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + BATCH_SIZE, processedProducts.length),
          );
        }
      },
      { rootMargin: "1200px 0px" },
    );

    observer.observe(observerTarget);
    return () => observer.disconnect();
  }, [observerTarget, hasMore, processedProducts.length, visibleCount]);

  const visibleProducts = useMemo(() => {
    return processedProducts.slice(0, visibleCount);
  }, [processedProducts, visibleCount]);

  return (
    <ErrorBoundary>
      <>
        {/* Search + filters temporarily disabled on landing — re-enable later
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md"
        >
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </motion.div>

        <ProductFilter
          filters={filters}
          onFilterChange={setFilters}
          categories={categories}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-muted/50 flex flex-col items-center justify-between gap-4 rounded-lg p-4 sm:flex-row"
        >
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>
              Showing {processedProducts.length} of {products?.length || 0}{" "}
              products
            </span>
          </div>

          {(filters.sortBy !== "default" ||
            filters.stockFilter !== "all" ||
            filters.categoryFilter !== "all" ||
            searchTerm.trim() !== "") && (
            <button
              onClick={() => {
                setFilters({
                  sortBy: "default",
                  stockFilter: "all",
                  categoryFilter: "all",
                });
                setSearchTerm("");
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-3 py-1 text-xs transition-colors"
            >
              Reset All Filters
            </button>
          )}
        </motion.div>
        */}

        <div className="py-4">
          {loading && !initialProducts?.length ? (
            <BrandLoader size="md" />
          ) : error ? (
            <ErrorState
              title="Failed to load products"
              description="We couldn't load the products. Please try again."
              onRetry={retry}
              error={error}
              type="network"
            />
          ) : processedProducts.length === 0 ? (
            <>
              <ErrorState
                title={
                  (products?.length || 0) === 0
                    ? "No products available"
                    : "No products match your filters"
                }
                description={
                  (products?.length || 0) === 0
                    ? "No products are currently available. Please check back later."
                    : searchTerm.trim() !== ""
                      ? "Try a different search term or adjust your filters."
                      : "Try adjusting your filters to see more products."
                }
                showRetry={false}
                type="not-found"
              />
              {(products?.length || 0) > 0 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      setFilters({
                        sortBy: "default",
                        stockFilter: "all",
                        categoryFilter: "all",
                      });
                      setSearchTerm("");
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {visibleProducts.map((product, index) => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    priority={index < 4}
                  />
                ))}

                {hasMore && (
                  <>
                    <div
                      ref={setObserverTarget}
                      className="col-span-full h-px w-full"
                      aria-hidden="true"
                    />
                    <ProductCardSkeleton key="skeleton-0" />
                    <ProductCardSkeleton
                      key="skeleton-1"
                      className="hidden sm:block"
                    />
                    <ProductCardSkeleton
                      key="skeleton-2"
                      className="hidden md:block"
                    />
                    <ProductCardSkeleton
                      key="skeleton-3"
                      className="hidden lg:block"
                    />
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </>
    </ErrorBoundary>
  );
}
