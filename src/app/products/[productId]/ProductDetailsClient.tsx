"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ProductType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  // Heart,
  // Share2,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
  Check,
} from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { formatCurrency } from "@/utils/formatCurrency";
import { useStoreSettings } from "@/hooks/queries/use-store-settings";
import { DEFAULT_STORE_SETTINGS } from "@/lib/storeSettingsDefaults";
import { ReviewTab } from "./_components/review-tab";
import {
  getProductSalePrice,
  hasActiveDiscount,
  normalizeDiscountPercent,
} from "@/utils/productPricing";
import { useProduct } from "@/hooks/queries";

type ProductDetailsClientProps = {
  product: ProductType;
};

export default function ProductDetailsClient({
  product: initialProduct,
}: ProductDetailsClientProps) {
  const { addToCart, cartItems } = useCart();
  const { data: settings } = useStoreSettings();
  const shippingPrice =
    settings?.shipping_price ?? DEFAULT_STORE_SETTINGS.shipping_price;
  const { data: liveProduct } = useProduct(initialProduct.product_id, {
    initialData: initialProduct,
  });
  const product = liveProduct ?? initialProduct;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<"details" | "care" | null>(
    null,
  );
  // const [isFavorited, setIsFavorited] = useState(false);

  const toggleAccordion = (section: "details" | "care") => {
    setOpenAccordion((prev) => (prev === section ? null : section));
  };

  const uniqueItem = product.stock <= 1;
  const alreadyInCart = cartItems.some(
    (item) => item.product_id === product.product_id,
  );
  const soldOut = product.stock <= 0;
  const discountPercent = normalizeDiscountPercent(product.discount_percent);
  const onSale = hasActiveDiscount(discountPercent);
  const salePrice = getProductSalePrice(product);

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : ["/placeholder-product.jpg"];

  const handleAddToCart = async () => {
    try {
      if (uniqueItem) {
        addToCart(product);
      } else {
        for (let i = 0; i < quantity; i++) {
          addToCart(product);
        }
      }
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2000);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex(
      (prev) => (prev - 1 + productImages.length) % productImages.length,
    );
  };

  return (
    <div className="py-8">
      <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="bg-muted relative aspect-square overflow-hidden rounded-lg">
            <div className="relative h-full w-full">
              {productImages.length > 0 && productImages[0] !== "/placeholder-product.jpg" ? (
                productImages.map((src, index) => (
                  <Image
                    key={`${src}-${index}`}
                    src={src}
                    alt={product.title}
                    fill
                    priority={index <= 1}
                    loading="eager"
                    quality={75}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className={`object-contain transition-opacity duration-150 ${
                      selectedImageIndex === index
                        ? "opacity-100 z-10"
                        : "opacity-0 pointer-events-none z-0"
                    }`}
                  />
                ))
              ) : productImages[0] ? (
                <Image
                  src={productImages[0]}
                  alt={product.title}
                  fill
                  priority
                  quality={75}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                />
              ) : (
                <div className="bg-muted flex h-full w-full items-center justify-center">
                  <span className="text-muted-foreground text-sm">
                    No image available
                  </span>
                </div>
              )}
            </div>

            {productImages.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="bg-background/80 absolute top-1/2 left-4 z-20 -translate-y-1/2 cursor-pointer backdrop-blur-sm"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="bg-background/80 absolute top-1/2 right-4 z-20 -translate-y-1/2 cursor-pointer backdrop-blur-sm"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Heart + Share
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background/80 cursor-pointer backdrop-blur-sm"
                  onClick={() => setIsFavorited(!isFavorited)}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isFavorited ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background/80 cursor-pointer backdrop-blur-sm"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              */}

            {/* {product.show_sale_tag && (
              <div className="absolute top-0 right-0 z-20 bg-black px-2.5 py-1 text-[11px] leading-none font-medium text-white">
                Sale
              </div>
            )} */}
          </div>

          {productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((image, index) => (
                <motion.button
                  key={index}
                  className={`aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${
                    selectedImageIndex === index
                      ? "border-primary"
                      : "border-border"
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    width={100}
                    height={100}
                    loading="eager"
                    sizes="96px"
                    className="h-full w-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <motion.h1
              className="text-foreground mb-2 text-3xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {product.title}
            </motion.h1>

            {/* <motion.div
                className="mb-4 flex items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <RenderStars rating={product.rating || 0} size="sm" />
              </motion.div> */}

            <motion.div
              className="mb-6 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                {onSale && (
                  <span className="text-muted-foreground text-xl line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
                <span className="text-foreground text-3xl font-bold">
                  {formatCurrency(salePrice)}
                </span>
              </div>
              {onSale && (
                <span className="inline-flex rounded-full bg-[#f05a2d] px-3.5 py-1 text-xs font-bold tracking-wide text-white uppercase">
                  {discountPercent}% OFF
                </span>
              )}
              <div className="flex flex-wrap items-center gap-3">
                {soldOut ? (
                  <Badge variant="destructive">Sold Out</Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                  >
                    In Stock - {product.stock} available
                  </Badge>
                )}
              </div>
            </motion.div>
          </div>

          {/* Quantity and Add to Cart */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div>
              {!uniqueItem && (
                <>
                  <h3 className="mb-3 font-medium">Quantity</h3>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="border-border flex items-center rounded-lg border">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        className="cursor-pointer"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="min-w-[60px] px-4 py-2 text-center">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={incrementQuantity}
                        disabled={quantity >= product.stock}
                        className="cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {product.stock} available
                    </span>
                  </div>
                </>
              )}
            </div>

            <Button
              size="lg"
              className="w-full cursor-pointer"
              disabled={soldOut || (uniqueItem && alreadyInCart)}
              onClick={handleAddToCart}
            >
              {isAddedToCart ? (
                <>
                  <Check className="mr-2 size-6" />
                  Added to Cart!
                </>
              ) : soldOut ? (
                "Sold Out"
              ) : uniqueItem && alreadyInCart ? (
                "Already in Cart"
              ) : (
                <>
                  <ShoppingCart className="mr-2 size-6" />
                  Add to Cart —{" "}
                  {formatCurrency(salePrice * (uniqueItem ? 1 : quantity))}
                </>
              )}
            </Button>
          </motion.div>

          {/* Shipping Info */}
          <motion.div
            className="border-border grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <Truck className="text-primary h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Pakistan Shipping</p>
                <p className="text-muted-foreground text-xs">
                  Flat {formatCurrency(shippingPrice)} COD
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="text-primary h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Cash on Delivery</p>
                <p className="text-muted-foreground text-xs">
                  Pay when you receive
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="text-primary h-5 w-5" />
              <div>
                <p className="text-sm font-medium">
                  {(product.show_badge ?? true)
                    ? product.badge === "new"
                      ? "New"
                      : "Pre-loved"
                    : "Quality checked"}
                </p>
                <p className="text-muted-foreground text-xs">
                  Usually one of a kind
                </p>
              </div>
            </div>
          </motion.div>

          {/* Details Accordion */}
          <motion.div
            className="border-border border-t"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="border-border border-b">
              <button
                type="button"
                onClick={() => toggleAccordion("details")}
                className="flex w-full cursor-pointer items-center justify-between py-5 text-left"
                aria-expanded={openAccordion === "details"}
              >
                <span className="text-foreground text-base font-semibold">
                  Details
                </span>
                <motion.span
                  animate={{ rotate: openAccordion === "details" ? 45 : 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="inline-flex"
                >
                  <Plus className="text-foreground h-4 w-4 shrink-0" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openAccordion === "details" && (
                  <motion.div
                    key="details"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pb-5">
                      {/<[a-z][\s\S]*>/i.test(product.description || "") ? (
                        <div
                          className="prose prose-sm dark:prose-invert text-muted-foreground [&_a]:text-primary [&_blockquote]:border-primary/40 max-w-none text-sm leading-relaxed [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic [&_hr]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                          dangerouslySetInnerHTML={{
                            __html: product.description,
                          }}
                        />
                      ) : (
                        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                          {product.description}
                        </p>
                      )}
                      {product.sku && (
                        <p className="text-muted-foreground mt-3 text-sm">
                          <span className="text-foreground font-medium">
                            SKU:
                          </span>{" "}
                          {product.sku}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="border-border border-b">
              <button
                type="button"
                onClick={() => toggleAccordion("care")}
                className="flex w-full cursor-pointer items-center justify-between py-5 text-left"
                aria-expanded={openAccordion === "care"}
              >
                <span className="text-foreground text-base font-semibold">
                  Care Instructions
                </span>
                <motion.span
                  animate={{ rotate: openAccordion === "care" ? 45 : 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="inline-flex"
                >
                  <Plus className="text-foreground h-4 w-4 shrink-0" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openAccordion === "care" && (
                  <motion.div
                    key="care"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="text-muted-foreground space-y-2 pb-5 text-sm leading-relaxed">
                      <p>Gentle wash or dry clean when needed.</p>
                      <p>Avoid harsh detergents and high-heat drying.</p>
                      <p>
                        Store flat or hung to help preserve shape and fabric.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Customer Reviews */}
      <motion.div
        className="mx-auto mb-12 max-w-3xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <ReviewTab product={product} />
      </motion.div>
    </div>
  );
}
