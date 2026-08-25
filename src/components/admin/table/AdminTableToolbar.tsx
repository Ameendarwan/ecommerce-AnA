import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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
      <div className="relative min-w-0 flex-1">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 rounded-lg pl-9"
        />
      </div>
      {filters ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {filters}
        </div>
      ) : null}
    </div>
  );
}
