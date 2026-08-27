import { cache } from "react";
import { notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";
import { productServerService } from "@/services/product/productServerService";
import { ProductType } from "@/types";
import {
  breadcrumbJsonLd,
  JsonLd,
  pageMetadata,
  SITE,
} from "@/lib/seo";
import { LcpImagePreload } from "@/components/LcpImagePreload";
import { normalizeProductId } from "@/lib/utils";

export const revalidate = 60;

interface ProductDetailsPageProps {
  params: Promise<{ productId: string }>;
}

/** Dedupes fetch between generateMetadata + page (React cache). */
const getProduct = cache((id: string) => {
  const cleanId = normalizeProductId(id);
  if (!cleanId) return Promise.resolve(null);
  return productServerService.getProductById(cleanId);
});

function getProductImage(product: ProductType): string {
  return product.images?.[0] || product.image || SITE.ogImage;
}

export async function generateMetadata({ params }: ProductDetailsPageProps) {
  const { productId } = await params;
  const product = await getProduct(productId);

  if (!product) {
    return { title: "Product Not Found", robots: { index: false, follow: false } };
  }

  const image = getProductImage(product);
  const isExternal = typeof image === "string" && (image.startsWith("http://") || image.startsWith("https://"));

  return pageMetadata({
    title: product.title,
    description:
      product.description?.trim() ||
      `Shop ${product.title} at Thriftonia — style for less, quality for more.`,
    path: `/products/${product.product_id}`,
    image,
    imageWidth: isExternal ? 1200 : undefined,
    imageHeight: isExternal ? 1200 : undefined,
  });
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { productId } = await params;
  const product = await getProduct(productId);

  if (!product) {
    notFound();
  }

  const image = getProductImage(product);
  const path = `/products/${product.product_id}`;

  return (
    <>
      <LcpImagePreload
        src={image}
        width={828}
        height={828}
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.description || undefined,
          image: [image],
          brand: { "@type": "Brand", name: SITE.name },
          offers: {
            "@type": "Offer",
            price: Number(product.price) || 0,
            priceCurrency: "PKR",
            availability:
              product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            url: `https://thriftonia.pk${path}`,
          },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: product.title, path },
        ])}
      />
      <ProductDetailsClient product={product} />
    </>
  );
}
