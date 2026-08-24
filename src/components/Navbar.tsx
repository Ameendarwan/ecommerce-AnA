"use client";
import { ShoppingCart, Moon, Sun, User, LogIn, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return null; // Return null on first render to avoid hydration mismatch
  }

  return (
    <nav className="border-border bg-background/95 supports-backdrop-filter:bg-background/60 w-full border-b backdrop-blur">
      <div className="mx-4 flex h-24 items-center">
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
          {" "}
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
          {user ? (
            <Button
              variant="ghost"
              size="icon-lg"
              className="hover:bg-muted/50 cursor-pointer transition-colors duration-200 [&_svg]:!size-5"
              onClick={() => router.push("/profile")}
            >
              <User className="size-5" />
              <span className="sr-only">{user ? "Profile" : "Sign in"}</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-lg"
              className="hover:bg-muted/50 cursor-pointer transition-colors duration-200 [&_svg]:!size-5"
              onClick={() => router.push("/signup")}
            >
              <LogIn className="size-5" />
              <span className="sr-only">Sign in</span>
            </Button>
          )}
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon-lg"
              className="hover:bg-muted/50 relative cursor-pointer transition-colors duration-200 [&_svg]:!size-5"
            >
              <ShoppingCart className="size-5" />
              {totalItems > 0 && (
                <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[11px] font-medium">
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
