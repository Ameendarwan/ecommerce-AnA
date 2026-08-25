import type { Metadata } from "next";

export const SITE = {
  name: "Thriftonia",
  url: "https://thriftonia.pk",
  description: "Style for less, quality for more",
  locale: "en_PK",
  /** Used as the default social preview (WhatsApp, iMessage, etc.) */
  ogImage: "/brand-logo-2.png",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, SITE.url).href;
}

export const brandOgImage = {
  url: SITE.ogImage,
  alt: SITE.name,
  width: 1200,
  height: 1200,
} as const;

type PageMetaOpts = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

/** Shared Metadata builder — OG + Twitter + canonical in one place. */
export function pageMetadata({
  title,
  description,
  path,
  image = SITE.ogImage,
}: PageMetaOpts): Metadata {
  const url = absoluteUrl(path);
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
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
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
