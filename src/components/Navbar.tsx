"use client";
import { ShoppingCart, Moon, Sun, User, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useStoreSettings } from "@/hooks/queries/use-store-settings";

export function Navbar() {
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const { data: storeSettings } = useStoreSettings();

  const showThemeToggle = storeSettings?.show_theme_toggle ?? true;

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Placeholder keeps header height stable before theme hydrates (prevents CLS).
  if (!mounted) {
    return (
      <nav
        className="border-border bg-background/95 w-full border-b"
        aria-hidden
      >
        <div className="mx-4 flex h-24 items-center" />
      </nav>
    );
  }

  return (
    <nav className="border-border bg-background/95 supports-backdrop-filter:bg-background/60 w-full border-b backdrop-blur">
      <div className="mx-2 flex h-16 items-center sm:mx-4 sm:h-24">
        <div className="flex flex-1 justify-start">
          <Button
            variant="ghost"
            size="icon-lg"
            className="hover:bg-muted/50 cursor-pointer transition-colors duration-200 [&_svg]:!size-5"
            onClick={toggleSidebar}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
        </div>

        <div className="flex h-24 flex-1 justify-center">
          <Link href="/" className="flex cursor-pointer items-center">
            <Image
              src="/brand-logo-2.png"
              alt="Thriftonia"
              width={160}
              height={100}
              className="mt-2.5 h-32 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {showThemeToggle && (
            <Button
              variant="ghost"
              size="icon-lg"
              className="hover:bg-muted/50 cursor-pointer transition-colors duration-200 [&_svg]:!size-5"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-lg"
            className="hover:bg-muted/50 cursor-pointer transition-colors duration-200 [&_svg]:!size-5"
            onClick={() => router.push(user ? "/profile" : "/signup")}
          >
            <User className="size-5" />
            <span className="sr-only">{user ? "Profile" : "Sign in"}</span>
          </Button>
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon-lg"
              className="hover:bg-muted/50 relative cursor-pointer transition-colors duration-200 [&_svg]:!size-5"
            >
              <ShoppingCart className="size-5" />
              {totalItems > 0 && (
                <span className="bg-primary text-primary-foreground absolute top-1 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[11px] font-medium">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Shopping cart</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
