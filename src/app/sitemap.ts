import type { MetadataRoute } from "next";
import { productServerService } from "@/services/product/productServerService";
import { SITE } from "@/lib/seo";

const BASE_URL = SITE.url;

const STATIC_PAGES: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: `${BASE_URL}/shirts`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/shoes`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/bags`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await productServerService.getProducts();

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/products/${product.product_id}`,
    lastModified: product.updated_at
      ? new Date(product.updated_at)
      : product.created_at
        ? new Date(product.created_at)
        : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...STATIC_PAGES, ...productEntries];
}
