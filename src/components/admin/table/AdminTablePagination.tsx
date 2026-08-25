import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePageNumbers } from "./usePageNumbers";

type AdminTablePaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  visibleCount: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
};

export function AdminTablePagination({
  currentPage,
  totalPages,
  totalItems,
  visibleCount,
  onPageChange,
  isLoading = false,
}: AdminTablePaginationProps) {
  const pageNumbers = usePageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-sm">
        Showing{" "}
        <span className="text-foreground font-medium">{visibleCount}</span> of{" "}
        <span className="text-foreground font-medium">{totalItems}</span> results
        {isLoading ? " · Refreshing…" : null}
      </p>

      <div className="flex flex-wrap items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>

        {pageNumbers.map((page, index) =>
          page === "…" ? (
            <span
              key={`ellipsis-${index}`}
              className="text-muted-foreground px-2 text-sm"
            >
              …
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "secondary" : "ghost"}
              size="icon-sm"
              className={cn(
                "size-8 rounded-md",
                page === currentPage && "bg-sky-100 text-sky-800",
              )}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ),
        )}

        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
