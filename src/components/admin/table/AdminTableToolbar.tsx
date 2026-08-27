import { SearchInput } from "@/components/ui/search-input";

type AdminTableToolbarProps = {
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: React.ReactNode;
};

export function AdminTableToolbar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filters,
}: AdminTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1">
        <SearchInput
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange("")}
          className="h-10 rounded-lg"
        />
      </div>
      {filters ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {filters}
        </div>
      ) : null}
    </div>
  );
}
