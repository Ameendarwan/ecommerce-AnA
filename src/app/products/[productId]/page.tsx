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

export const revalidate = 60;

interface ProductDetailsPageProps {
  params: Promise<{ productId: string }>;
}

/** Dedupes fetch between generateMetadata + page (React cache). */
const getProduct = cache((id: string) =>
  productServerService.getProductById(id),
);

function getProductImage(product: ProductType) {
  return product.images?.[0] || product.image || SITE.ogImage;
}

export async function generateMetadata({ params }: ProductDetailsPageProps) {
  const { productId } = await params;
  const product = await getProduct(productId);

  if (!product) {
    return { title: "Product Not Found", robots: { index: false, follow: false } };
  }

  return pageMetadata({
    title: product.title,
    description:
      product.description?.trim() ||
      `Shop ${product.title} at Thriftonia — style for less, quality for more.`,
    path: `/products/${product.product_id}`,
    image: getProductImage(product),
  });
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { productId } = await params;
  const product = await getProduct(productId);

  if (!product) notFound();

  const image = getProductImage(product);
  const path = `/products/${product.product_id}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.description,
          image: [image],
          brand: { "@type": "Brand", name: SITE.name },
          offers: {
            "@type": "Offer",
            price: product.price,
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
