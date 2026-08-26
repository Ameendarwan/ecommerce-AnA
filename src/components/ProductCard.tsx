"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductType } from "@/types";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { ShoppingCart, Badge as BadgeIcon } from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  getProductSalePrice,
  hasActiveDiscount,
  normalizeDiscountPercent,
} from "@/utils/productPricing";

interface ProductCardProps {
  product: ProductType;
  priority?: boolean;
}

function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart, removeFromCart, cartItems } = useCart();
  const router = useRouter();

  const soldOut = product.stock <= 0;
  const inCart = cartItems.some(
    (item) => item.product_id === product.product_id,
  );
  const conditionLabel = product.badge === "new" ? "New" : "Used";
  const discountPercent = normalizeDiscountPercent(product.discount_percent);
  const onSale = hasActiveDiscount(discountPercent);
  const salePrice = getProductSalePrice(product);

  const primaryImage = product.images?.[0] || product.image || null;
  const hoverImage =
    product.images && product.images.length > 1 ? product.images[1] : null;

  const handleProductClick = () => {
    router.push(`/products/${product.product_id}`);
  };

  const handleCartAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCart) {
      removeFromCart(product.product_id);
      return;
    }
    if (soldOut) return;
    addToCart(product);
  };

  return (
    <Card
      className="group relative cursor-pointer gap-0 overflow-hidden rounded-none border-0 bg-transparent py-0 shadow-none ring-0"
      onClick={handleProductClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-none">
        {primaryImage ? (
          <>
            <Image
              src={primaryImage}
              alt={product.title}
              width={400}
              height={533}
              priority={priority}
              quality={75}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`h-full w-full object-cover transition-all duration-700 ease-out ${
                hoverImage
                  ? "opacity-100 group-hover:opacity-0"
                  : "scale-100 group-hover:scale-110"
              }`}
              loading={priority ? undefined : "lazy"}
            />

            {hoverImage && (
              <Image
                src={hoverImage}
                alt={`${product.title} alternate view`}
                width={400}
                height={533}
                className="absolute inset-0 h-full w-full scale-100 object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-110 group-hover:opacity-100"
                loading="lazy"
              />
            )}
          </>
        ) : (
          <div className="bg-muted/50 flex h-full w-full items-center justify-center">
            <div className="text-center">
              <BadgeIcon className="text-muted-foreground/40 mb-2 h-8 w-8" />
              <span className="text-muted-foreground/60 text-xs font-medium">
                No Image
              </span>
            </div>
          </div>
        )}

        {product.show_sale_tag && (
          <div className="absolute top-0 right-0 z-20 bg-black px-2.5 py-1 text-[11px] leading-none font-medium text-white">
            Sale
          </div>
        )}

        {/* {product.stock > 1 && product.stock <= 5 && (
          <div className="absolute top-2 left-2 z-20">
            <div className="bg-accent text-accent-foreground rounded-md px-2 py-1 text-xs font-medium">
              {product.stock} left
            </div>
          </div>
        )} */}

        <div className="absolute inset-x-0 bottom-0 z-20 p-3 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
          <button
            type="button"
            onClick={handleCartAction}
            disabled={!inCart && soldOut}
            className={`flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-semibold shadow-md backdrop-blur-sm transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
              inCart
                ? "bg-background/95 text-foreground hover:bg-muted"
                : "bg-foreground text-background hover:bg-foreground/90"
            }`}
          >
            <ShoppingCart className="size-4" strokeWidth={2} />
            {inCart ? "Remove from cart" : soldOut ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>

      {/* Product Details */}
      <CardContent className="space-y-1.5 px-0 pt-3 pb-0">
        <p className="text-muted-foreground line-clamp-1 text-xs">
          {stripHtml(product.description) || "Pre-loved item in good condition."}
        </p>

        <h3 className="text-foreground group-hover:text-primary line-clamp-1 text-sm font-semibold transition-colors duration-200">
          {product.title}
        </h3>

        <div className="min-h-[3.25rem] space-y-1.5">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            {onSale && (
              <span className="text-muted-foreground text-sm line-through">
                {formatCurrency(product.price)}
              </span>
            )}
            <span className="text-foreground text-base font-bold">
              {formatCurrency(salePrice)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {onSale && (
              <span className="inline-flex rounded-full bg-[#f05a2d] px-3 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
                {discountPercent}% OFF
              </span>
            )}
            {(product.show_badge ?? true) && (
              <Badge variant="tag">{conditionLabel}</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
