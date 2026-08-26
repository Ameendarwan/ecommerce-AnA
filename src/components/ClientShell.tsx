"use client";

import { SplashScreen } from "@/components/SplashScreen";
import { CatalogRealtimeSync } from "@/components/CatalogRealtimeSync";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Toaster } from "sonner";

export function ClientShell() {
  return (
    <>
      <ScrollToTop />
      <CatalogRealtimeSync />
      <SplashScreen />
      <Toaster
        theme="light"
        toastOptions={{
          unstyled: false,
          classNames: {
            error: "bg-red-500 text-white border-red-600",
            success: "bg-green-500 text-white border-green-600",
            warning: "bg-yellow-500 text-black border-yellow-600",
            info: "bg-blue-500 text-white border-blue-600",
          },
        }}
      />
    </>
  );
}
