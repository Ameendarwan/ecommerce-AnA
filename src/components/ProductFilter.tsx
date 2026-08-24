"use client";

import { motion } from "motion/react";
import { Filter, SortAsc } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterOptions } from "@/hooks/queries";
import { CategoryType } from "@/types";

interface ProductFilterProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  categories?: CategoryType[];
}

const sortOptions = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

const stockOptions = [
  { value: "all", label: "All Products" },
  { value: "in-stock", label: "In Stock" },
  { value: "out-of-stock", label: "Out of Stock" },
];

export function ProductFilter({
  filters,
  onFilterChange,
  categories = [],
}: ProductFilterProps) {
  const handleSortChange = (value: string | null) => {
    if (value == null) return;
    onFilterChange({
      ...filters,
      sortBy: value as FilterOptions["sortBy"],
    });
  };

  const handleStockChange = (value: string | null) => {
    if (value == null) return;
    onFilterChange({
      ...filters,
      stockFilter: value as FilterOptions["stockFilter"],
    });
  };

  const handleCategoryChange = (value: string | null) => {
    if (value == null) return;
    onFilterChange({
      ...filters,
      categoryFilter: value === "all" ? "all" : Number(value),
    });
  };

  const categoryFilterValue =
    filters.categoryFilter === "all"
      ? "all"
      : String(filters.categoryFilter);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card flex flex-col gap-4 rounded-lg border p-4 sm:flex-row"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <Filter className="h-4 w-4" />
        <span>Filters:</span>
      </div>

      <div className="flex flex-1 flex-col gap-4 sm:flex-row">
        <div className="flex flex-col gap-2">
          <label className="text-muted-foreground text-xs font-medium">
            Sort by
          </label>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-muted-foreground text-xs font-medium">
            Stock Status
          </label>
          <Select value={filters.stockFilter} onValueChange={handleStockChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Stock status" />
            </SelectTrigger>
            <SelectContent>
              {stockOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-muted-foreground text-xs font-medium">
            Category
          </label>
          <Select
            value={categoryFilterValue}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
}
