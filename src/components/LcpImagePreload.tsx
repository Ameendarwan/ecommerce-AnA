import { getImageProps } from "next/image";

/** Preloads the LCP product image so it starts fetching during splash / early parse. */
export function LcpImagePreload({
  src,
  width = 640,
  height = 853,
  sizes = "100vw",
}: {
  src?: string | null;
  width?: number;
  height?: number;
  sizes?: string;
}) {
  if (!src) return null;

  const { props } = getImageProps({
    src,
    alt: "",
    width,
    height,
    quality: 75,
    priority: true,
    sizes,
  });

  return (
    // eslint-disable-next-line @next/next/no-head-element
    <link
      rel="preload"
      as="image"
      href={props.src}
      imageSrcSet={props.srcSet}
      imageSizes={props.sizes}
      fetchPriority="high"
    />
  );
}

export function getPrimaryProductImage(product: {
  images?: string[] | null;
  image?: string | null;
}) {
  return product.images?.[0] || product.image || null;
}
