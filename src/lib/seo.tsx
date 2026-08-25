import type { Metadata } from "next";

export const SITE = {
  name: "Thriftonia",
  // Use www — apex redirects here; WhatsApp often drops og:image on redirects
  url: "https://www.thriftonia.pk",
  description: "Style for less, quality for more",
  locale: "en_PK",
  /**
   * Social preview image (WhatsApp / iMessage / Facebook).
   * Keep under ~300KB — WhatsApp silently skips large PNGs.
   */
  ogImage: "/og-image.jpg",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, SITE.url).href;
}

export const brandOgImage = {
  url: SITE.ogImage,
  alt: SITE.name,
  width: 1200,
  height: 630,
  type: "image/jpeg",
} as const;

export const brandOgImageSquare = {
  url: "/og-image-square.jpg",
  alt: SITE.name,
  width: 1200,
  height: 1200,
  type: "image/jpeg",
} as const;

/** WhatsApp/Facebook fetch images more reliably from the site domain. */
export function resolveOgImageUrl(image: string): string {
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return absoluteUrl(`/api/og-image?src=${encodeURIComponent(image)}`);
  }
  return absoluteUrl(image);
}

type PageMetaOpts = {
  title: string;
  description: string;
  path: string;
  image?: string;
  /** Set for product pages — square photos should not use 1200×630 brand dimensions. */
  imageWidth?: number;
  imageHeight?: number;
};

/** Shared Metadata builder — OG + Twitter + canonical in one place. */
export function pageMetadata({
  title,
  description,
  path,
  image = SITE.ogImage,
  imageWidth = brandOgImage.width,
  imageHeight = brandOgImage.height,
}: PageMetaOpts): Metadata {
  const url = absoluteUrl(path);
  const ogImageUrl = resolveOgImageUrl(image);
  const isBrandImage = image === SITE.ogImage || image === brandOgImageSquare.url;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type: "website",
      images: isBrandImage
        ? [{ url: absoluteUrl("/api/og-image"), width: 1200, height: 630, alt: SITE.name, type: "image/png" }]
        : [
            {
              url: ogImageUrl,
              secureUrl: ogImageUrl,
              alt: title,
              width: imageWidth,
              height: imageHeight,
              type: "image/jpeg",
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export function categoryMetadata(name: string, slug: string): Metadata {
  return pageMetadata({
    title: name,
    description: `Shop ${name.toLowerCase()} at Thriftonia — style for less, quality for more.`,
    path: `/${slug}`,
  });
}

/** XSS-safe JSON-LD for App Router. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  logo: absoluteUrl(SITE.ogImage),
  description: SITE.description,
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  publisher: { "@type": "Organization", name: SITE.name },
};
