"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/seo";
import { STORE } from "@/lib/store";

const informationLinks = [
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact us" },
  { href: "/returns", label: "Returns & Exchange Policy" },
  { href: "/size-chart", label: "Size Chart" },
] as const;

const serviceLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/payment-options", label: "Payment Options" },
] as const;

const socials = [
  {
    name: "TikTok",
    href: STORE.socials.tiktok,
    className: "bg-black",
    icon: (
      <svg viewBox="0 0 24 24" className="size-6 fill-white" aria-hidden>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.1 15.31a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.18 8.18 0 0 0 4.76 1.52V6.84a4.85 4.85 0 0 1-.95-.15z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: STORE.socials.youtube,
    className: "bg-[#FF0000]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-6 fill-white" aria-hidden>
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: STORE.socials.facebook,
    className: "bg-[#1877F2]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-6 fill-white" aria-hidden>
        <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: STORE.socials.instagram,
    className:
      "bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285AEB_90%)]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-6 fill-white" aria-hidden>
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.69 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
      </svg>
    ),
  },
] as const;

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        {label}
      </Link>
    </li>
  );
}

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-border bg-background mt-auto border-t">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* About */}
          <div className="space-y-5">
            <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
              About Us
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {SITE.name} brings you style for less — curated fashion, shoes,
              bags, and more with quality you can trust every time.
            </p>
            <div>
              <p className="text-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
                Our Socials
              </p>
              <div className="flex flex-wrap gap-3">
                {socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className={`flex size-12 items-center justify-center rounded-xl shadow-sm transition-transform hover:scale-105 ${social.className}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Informations */}
          <div className="space-y-5">
            <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
              Informations
            </h3>
            <ul className="space-y-3">
              {informationLinks.map((link) => (
                <FooterLink key={link.href} {...link} />
              ))}
            </ul>
          </div>

          {/* Customer Services */}
          <div className="space-y-5">
            <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
              Customer Services
            </h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <FooterLink key={link.href} {...link} />
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-5">
            <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
              Connect With Us
            </h3>
            <ul className="text-muted-foreground space-y-3 text-sm">
              <li>
                <a
                  href={`tel:${STORE.phone.replace(/-/g, "")}`}
                  className="hover:text-foreground transition-colors"
                >
                  {STORE.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${STORE.email}`}
                  className="hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  {STORE.email}
                </a>
              </li>
              <li>{STORE.hours}</li>
            </ul>
          </div>
        </div>

        <div className="border-border text-muted-foreground mt-12 border-t pt-6 text-center text-xs">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
