import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TanStackQueryProvider } from "@/lib/providers/query-provider";
import { MainLayout } from "@/components/MainLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppHeader } from "@/components/AppHeader";
import { ClientShell } from "@/components/ClientShell";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { SITE, brandOgImage, brandOgImageSquare } from "@/lib/seo";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  adjustFontFallback: true,
});

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    images: [brandOgImage, brandOgImageSquare],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
    images: [SITE.ogImage, brandOgImageSquare.url],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
    >
      <head>
        {supabaseOrigin ? (
          <>
            <link rel="preconnect" href={supabaseOrigin} crossOrigin="" />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        ) : null}
      </head>
      <body className="bg-background min-h-screen">
        <ErrorBoundary>
          <TanStackQueryProvider>
            <AuthProvider>
              <CartProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  <SidebarProvider defaultOpen={false}>
                    <ClientShell />
                    <Sidebar />
                    <SidebarInset>
                      <AppHeader>
                        <Navbar />
                      </AppHeader>
                      <MainLayout>{children}</MainLayout>
                    </SidebarInset>
                  </SidebarProvider>
                </ThemeProvider>
              </CartProvider>
            </AuthProvider>
          </TanStackQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
