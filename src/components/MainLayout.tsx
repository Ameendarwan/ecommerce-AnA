"use client";

import { Footer } from "@/components/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="w-full flex-1 px-4 md:container md:mx-auto">{children}</div>
      <Footer />
    </div>
  );
}
