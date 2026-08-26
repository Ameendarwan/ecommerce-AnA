"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { WhatsAppSupport } from "@/components/WhatsAppSupport";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

const AUTH_PATH_PREFIXES = ["/signin", "/signup", "/reset-password"];

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isAuthPage = AUTH_PATH_PREFIXES.some(
    (path) => pathname === path || pathname?.startsWith(`${path}/`)
  );

  return (
    <div
      className={cn(
        "flex flex-1 flex-col",
        isAuthPage && "min-h-0 overflow-hidden"
      )}
    >
      {isAdmin ? (
        children
      ) : (
        <div
          className={cn(
            "w-full flex-1 px-4 md:container md:mx-auto",
            isAuthPage && "flex min-h-0 flex-col overflow-hidden p-0 md:px-0"
          )}
        >
          {children}
        </div>
      )}
      {!isAuthPage && <Footer />}
      <WhatsAppSupport />
    </div>
  );
}
