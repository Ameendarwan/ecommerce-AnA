import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export type AdminDataTableColumn<T> = {
  key: string;
  header: React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  render: (item: T) => React.ReactNode;
};

type AdminDataTableProps<T> = {
  columns: AdminDataTableColumn<T>[];
  data: T[];
  getRowKey: (item: T) => string | number;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  isLoading?: boolean;
};

export function AdminDataTable<T>({
  columns,
  data,
  getRowKey,
  emptyIcon,
  emptyTitle = "No results found",
  emptyDescription = "Try adjusting your search or filters.",
  isLoading = false,
}: AdminDataTableProps<T>) {
  if (isLoading && data.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-[#eef4fb] hover:bg-[#eef4fb]">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={column.headerClassName}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center"
                >
                  <div className="text-muted-foreground flex flex-col items-center gap-2">
                    {emptyIcon}
                    <p className="font-medium">{emptyTitle}</p>
                    <p className="text-sm">{emptyDescription}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  key={getRowKey(item)}
                  className="border-border/70"
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={column.cellClassName}
                    >
                      {column.render(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
