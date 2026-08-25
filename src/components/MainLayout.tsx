"use client";

import { Footer } from "@/components/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
