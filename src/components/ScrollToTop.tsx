"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ScrollHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // If there is an anchor hash in the URL, try to scroll smoothly to that element
    if (window.location.hash) {
      try {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
          return;
        }
      } catch {
        // In case of invalid selector in hash, fall through to scroll top
      }
    }

    const performScrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });

      if (document.documentElement && document.documentElement.scrollTop !== 0) {
        document.documentElement.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      }

      if (document.body && document.body.scrollTop !== 0) {
        document.body.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      }
    };

    // Scroll immediately
    performScrollToTop();

    // Additional triggers to handle streaming RSC, Suspense fallback transitions,
    // and layout shifts from lazy-loaded assets or client components
    const rafId = requestAnimationFrame(performScrollToTop);
    const timer1 = setTimeout(performScrollToTop, 60);
    const timer2 = setTimeout(performScrollToTop, 180);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;

      if (
        target.target === "_blank" ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      if (href.startsWith("#")) {
        return;
      }

      if (href === pathname || href === window.location.pathname) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      }
    };

    document.addEventListener("click", handleLinkClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true });
    };
  }, [pathname]);

  return null;
}

export function ScrollToTop() {
  return (
    <Suspense fallback={null}>
      <ScrollHandler />
    </Suspense>
  );
}
