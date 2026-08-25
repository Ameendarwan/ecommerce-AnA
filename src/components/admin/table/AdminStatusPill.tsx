import { cn } from "@/lib/utils";

const DEFAULT_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  processing: "bg-sky-50 text-sky-700 ring-sky-200",
  shipped: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  admin: "bg-violet-50 text-violet-700 ring-violet-200",
  user: "bg-sky-50 text-sky-700 ring-sky-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  inactive: "bg-slate-50 text-slate-600 ring-slate-200",
};

const DEFAULT_DOTS: Record<string, string> = {
  pending: "bg-amber-500",
  processing: "bg-sky-500",
  shipped: "bg-indigo-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-rose-500",
  admin: "bg-violet-500",
  user: "bg-sky-500",
  active: "bg-emerald-500",
  inactive: "bg-slate-400",
};

type AdminStatusPillProps = {
  label: string;
  tone?: string;
  styles?: Record<string, string>;
  dots?: Record<string, string>;
};

export function AdminStatusPill({
  label,
  tone,
  styles = DEFAULT_STYLES,
  dots = DEFAULT_DOTS,
}: AdminStatusPillProps) {
  const key = tone?.toLowerCase() || label.toLowerCase();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        styles[key] ?? "bg-slate-50 text-slate-700 ring-slate-200",
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", dots[key] ?? "bg-slate-400")}
      />
      {label}
    </span>
  );
}
