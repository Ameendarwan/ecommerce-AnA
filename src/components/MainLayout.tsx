"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <div className="flex flex-1 flex-col">
      {isAdmin ? (
        children
      ) : (
        <div className="w-full flex-1 px-4 md:container md:mx-auto">
          {children}
        </div>
      )}
      <Footer />
    </div>
  );
}