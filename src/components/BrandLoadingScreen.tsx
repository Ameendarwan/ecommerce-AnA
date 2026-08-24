"use client";

import Image from "next/image";
import { motion } from "motion/react";

export function BrandLoadingContent() {
  return (
    <div className="flex flex-col items-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative h-40 w-48 sm:h-48 sm:w-56 md:h-52 md:w-64"
      >
        <Image
          src="/brand-logo.png"
          alt="Thriftonia"
          fill
          priority
          className="object-contain object-top"
          sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, 256px"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.55, ease: "easeOut" }}
        className="-mt-6 flex w-full max-w-md items-center justify-center gap-3 px-2 sm:-mt-7"
      >
        <span className="h-px w-10 shrink-0 bg-[#B88E44]" aria-hidden />
        <p className="animate-pulse text-center text-sm leading-snug font-semibold tracking-wide text-[#031f16] sm:text-base">
          Style for Less and Quality For More
        </p>
        <span className="h-px w-10 shrink-0 bg-[#B88E44]" aria-hidden />
      </motion.div>
    </div>
  );
}

export function BrandLoadingScreen() {
  return (
    <div className="fixed inset-0 z-[90] flex min-h-screen items-center justify-center bg-[#faf8f5]">
      <BrandLoadingContent />
    </div>
  );
}
