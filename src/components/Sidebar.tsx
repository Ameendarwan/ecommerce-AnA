"use client";

import { useState, useEffect } from "react";
import {
  LogOut,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  User,
  RefreshCw,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useCategories } from "@/hooks/queries";
import { usePathname, useRouter } from "next/navigation";

const publicInfoLinks = [
  { name: "About us", href: "/about" },
  { name: "Contact us", href: "/contact" },
  { name: "Size chart", href: "/size-chart" },
  { name: "Shipping policy", href: "/shipping-policy" },
  { name: "Returns & exchanges", href: "/returns" },
  { name: "Payment options", href: "/payment-options" },
  { name: "Privacy policy", href: "/privacy" },
] as const;

function SidebarBackdrop() {
  const { open, setOpen, isMobile } = useSidebar();

  if (isMobile || !open) return null;

  return (
    <button
      type="button"
      aria-label="Close sidebar"
      className="fixed inset-0 z-[65] cursor-default bg-black/50 backdrop-blur-[1px] transition-opacity"
      onClick={() => setOpen(false)}
    />
  );
}

function NavLink({
  href,
  label,
  isActive,
  onNavigate,
}: {
  href: string;
  label: string;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "text-foreground hover:bg-muted/40 group flex items-center justify-between gap-3 border-b px-6 py-4 text-[15px] font-normal transition-colors",
        isActive && "bg-muted/30 font-medium",
      )}
    >
      <span className="min-w-0 truncate">{label}</span>
      <ChevronRight
        className={cn(
          "text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5",
          isActive && "text-foreground",
        )}
        aria-hidden
      />
    </Link>
  );
}

export default function Sidebar() {
  const [mounted, setMounted] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();

  const {
    data: categories,
    isLoading: loading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  const categoryItems = [
    { name: "All", href: "/" },
    ...(categories || []).map((category) => ({
      name: category.name,
      href: `/${category.name.toLowerCase()}`,
    })),
  ];

  const adminNavItems = [
    { name: "Admin Dashboard", href: "/admin" },
    { name: "Analytics", href: "/admin/analytics" },
    { name: "Products", href: "/admin/products" },
    { name: "Categories", href: "/admin/categories" },
    { name: "Orders", href: "/admin/orders" },
    { name: "Reviews", href: "/admin/reviews" },
    { name: "Questions", href: "/admin/questions" },
    { name: "Users", href: "/admin/users" },
    { name: "Settings", href: "/admin/settings" },
  ];

  return (
    <>
      <SidebarBackdrop />
      <ShadcnSidebar
        collapsible="offcanvas"
        className="z-70 border-r shadow-xl"
      >
        <SidebarHeader className="border-b p-0">
          {isMobile ? (
            <div className="flex w-full items-start justify-between px-2 py-4">
              <div className="size-9 shrink-0" aria-hidden />
              <Link
                href="/"
                onClick={closeMobileSidebar}
                className="flex items-center justify-center"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden">
                  <Image
                    src="/brand-logo.png"
                    alt="Thriftonia"
                    fill
                    className="object-cover"
                    sizes="80px"
                    priority
                  />
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-muted/50 size-9 shrink-0 [&_svg]:!size-6"
                onClick={() => setOpenMobile(false)}
                aria-label="Close menu"
              >
                <X className="size-6" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4">
              <Link
                href="/"
                onClick={closeMobileSidebar}
                className="flex items-center justify-center"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden">
                  <Image
                    src="/brand-logo.png"
                    alt="Thriftonia"
                    fill
                    className="object-cover"
                    sizes="80px"
                    priority
                  />
                </div>
              </Link>
            </div>
          )}
        </SidebarHeader>

        {/* <div className="border-b bg-background px-5 py-4">
          <label htmlFor="sidebar-search" className="sr-only">
            Search products
          </label>
          <div className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
              aria-hidden
            />
            <Input
              id="sidebar-search"
              type="search"
              placeholder="Search products..."
              autoComplete="off"
              enterKeyHint="search"
              className="border-border bg-muted/70 h-12 w-full rounded-xl border pl-12 text-base shadow-none placeholder:text-muted-foreground/70 focus-visible:border-border focus-visible:bg-background focus-visible:ring-0"
            />
          </div>
        </div> */}

        <SidebarContent className="gap-0 overflow-y-auto p-0">
          {user && isAdmin && (
            <div className="border-b">
              <p className="text-muted-foreground px-6 pt-4 pb-2 text-xs tracking-wide uppercase">
                Administration
              </p>
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.name}
                  href={item.href}
                  label={item.name}
                  isActive={pathname === item.href}
                  onNavigate={closeMobileSidebar}
                />
              ))}
            </div>
          )}

          <div>
            <p className="text-muted-foreground px-6 pt-4 pb-2 text-xs tracking-wide uppercase">
              Shop
            </p>
            {loading ? (
              <div className="animate-pulse space-y-0 px-6 py-2">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-muted mb-3 h-10 rounded" />
                ))}
              </div>
            ) : categoriesError ? (
              <div className="text-destructive space-y-2 px-6 py-4 text-sm">
                <p>Couldn&apos;t load categories</p>
                <button
                  type="button"
                  onClick={() => void refetchCategories()}
                  className="hover:bg-muted flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs"
                >
                  <RefreshCw className="size-3" />
                  Retry
                </button>
              </div>
            ) : (
              <nav aria-label="Shop categories">
                {categoryItems.map((category) => (
                  <NavLink
                    key={category.name}
                    href={category.href}
                    label={category.name}
                    isActive={pathname === category.href}
                    onNavigate={closeMobileSidebar}
                  />
                ))}
              </nav>
            )}
          </div>

          <div>
            <p className="text-muted-foreground px-6 pt-4 pb-2 text-xs tracking-wide uppercase">
              Help & info
            </p>
            <nav aria-label="Help and information">
              {publicInfoLinks.map((item) => (
                <NavLink
                  key={item.name}
                  href={item.href}
                  label={item.name}
                  isActive={pathname === item.href}
                  onNavigate={closeMobileSidebar}
                />
              ))}
            </nav>
          </div>
        </SidebarContent>

        <SidebarFooter className="mt-auto border-t p-0">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="hover:bg-muted/40 flex w-full cursor-pointer items-center gap-3 px-6 py-4 text-left transition-colors"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-muted text-sm font-medium">
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {user.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {user.email}
                      </p>
                    </div>
                    <ChevronRight
                      className="text-muted-foreground size-4 shrink-0"
                      aria-hidden
                    />
                  </button>
                }
              />
              <DropdownMenuContent align="start" side="top" className="w-56">
                <DropdownMenuItem onClick={() => router.replace("/profile")}>
                  <User className="mr-2 size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.replace("/cart")}>
                  <ShoppingCart className="mr-2 size-4" />
                  Cart
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.replace("/dashboard")}>
                  <LayoutDashboard className="mr-2 size-4" />
                  Dashboard
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => router.replace("/admin")}>
                    <Settings className="mr-2 size-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/signin"
              onClick={closeMobileSidebar}
              className="hover:bg-muted/40 group flex items-center justify-between gap-3 px-6 py-4 text-[15px] transition-colors"
            >
              <span>Log in</span>
              <ChevronRight
                className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          )}
        </SidebarFooter>
      </ShadcnSidebar>
    </>
  );
}
