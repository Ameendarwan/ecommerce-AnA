import { cn } from "@/lib/utils";

type AdminEntityCellProps = {
  initials: string;
  title: string;
  subtitle?: string;
  avatarClassName?: string;
};

export function AdminEntityCell({
  initials,
  title,
  subtitle,
  avatarClassName,
}: AdminEntityCellProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-xs font-semibold text-sky-800",
          avatarClassName,
        )}
      >
        {initials || "#"}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-900">{title}</p>
        {subtitle ? (
          <p className="text-muted-foreground truncate text-xs">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
