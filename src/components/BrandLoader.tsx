"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLoaderProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
};

const sizes = {
  sm: { box: "h-12 w-12", img: 48 },
  md: { box: "h-20 w-20", img: 80 },
  lg: { box: "h-28 w-28", img: 112 },
};

export function BrandLoader({
  size = "md",
  className,
  label = "Loading…",
}: BrandLoaderProps) {
  const s = sizes[size];

  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center gap-3",
        className,
      )}
      role="status"
      aria-label={label}
    >
      <div className={cn("relative animate-pulse", s.box)}>
        <Image
          src="/brand-logo.png"
          alt=""
          width={s.img}
          height={s.img}
          className="h-full w-full object-contain"
          priority
        />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
