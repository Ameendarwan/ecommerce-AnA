"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { STORE_COUNTRY } from "@/lib/shipping";
import { formatCurrency } from "@/utils/formatCurrency";
import { CategoryType, FaqItemType } from "@/types";
import { useCategories } from "@/hooks/queries/use-categories";

export interface FaqItem {
  id: string;
  question: string;
  answer: string | React.ReactNode;
  category?: string;
}

interface FaqClientProps {
  initialFaqs?: FaqItemType[];
  initialCategories?: CategoryType[];
  storePhone?: string;
  storeEmail?: string;
  storeAddress?: string;
  storeHours?: string;
  shippingPrice?: number;
}

export function FaqClient({
  initialFaqs,
  initialCategories,
  storePhone,
  storeEmail,
  storeAddress,
  storeHours,
  shippingPrice = 300,
}: FaqClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const { data: dynamicCategories } = useCategories({
    initialData: initialCategories,
  });

  const categoryList: CategoryType[] = useMemo(() => {
    if (dynamicCategories && dynamicCategories.length > 0) {
      return dynamicCategories;
    }
    if (initialCategories && initialCategories.length > 0) {
      return initialCategories;
    }
    return [
      { id: 1, name: "Shirts", description: "" },
      { id: 2, name: "Clothing", description: "" },
      { id: 3, name: "Shoes", description: "" },
      { id: 4, name: "Bags", description: "" },
      { id: 5, name: "Accessories", description: "" },
      { id: 6, name: "Electronics", description: "" },
    ];
  }, [dynamicCategories, initialCategories]);

  const defaultFaqs: FaqItem[] = useMemo(
    () => [
      {
        id: "what-is-thriftonia",
        question: "What is Thriftonia?",
        answer: (
          <p>
            Thriftonia is your premier online destination for curated fashion,
            apparel, shoes, bags, and everyday lifestyle essentials at
            unbeatable prices. We bring you style for less with quality you can
            trust every time.
          </p>
        ),
      },
      {
        id: "what-products",
        question: "What products do you have?",
        answer: (
          <div className="space-y-2">
            <p>
              We offer a wide collection of fashion and lifestyle products,
              including:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {categoryList.map((cat) => {
                const href = `/${cat.name.toLowerCase().trim().replace(/\s+/g, "-")}`;
                return (
                  <li key={cat.id}>
                    <Link
                      href={href}
                      className="text-foreground underline underline-offset-2"
                    >
                      {cat.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ),
      },
      {
        id: "physical-store",
        question: "Does Thriftonia have a physical store?",
        answer: (
          <p>
            Currently, we operate primarily online through our web store to
            provide nationwide delivery across {STORE_COUNTRY} at the best
            possible prices. Our operational base and fulfillment center is
            located at{" "}
            <strong>
              {storeAddress || "B-213 Phase-1, Gulshan Hadeed, Karachi"}
            </strong>
            .
          </p>
        ),
      },
      {
        id: "delivery-time",
        question: "What is the delivery time?",
        answer: (
          <div className="space-y-2">
            <p>
              Orders are typically confirmed within 24 hours of placement.
              Estimated delivery times are:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Major Cities:</strong> 2 to 5 business days.
              </li>
              <li>
                <strong>Other Regions:</strong> 3 to 7 business days.
              </li>
            </ul>
            <p className="text-muted-foreground text-xs">
              Please note that deliveries may take slightly longer during public
              holidays, flash sales, or unforeseen weather events.
            </p>
          </div>
        ),
      },
      {
        id: "delivery-service",
        question: "What delivery service is used?",
        answer: (
          <p>
            We partner with reliable courier services across {STORE_COUNTRY}{" "}
            (including TCS, Leopards, Trax, Call Courier, and PostEx) to ensure
            safe, fast, and trackable doorstep delivery.
          </p>
        ),
      },
      {
        id: "payment-options",
        question: "What payment options are available?",
        answer: (
          <div className="space-y-2">
            <p>
              We offer convenient <strong>Cash on Delivery (COD)</strong> for
              orders across {STORE_COUNTRY}. You pay in cash directly to the
              courier rider upon receiving your parcel.
            </p>
            <p>
              Standard shipping fee is{" "}
              <strong>{formatCurrency(shippingPrice)}</strong>, which will be
              clearly shown at checkout. For more information, visit our{" "}
              <Link
                href="/payment-options"
                className="text-foreground underline underline-offset-2"
              >
                Payment Options
              </Link>{" "}
              page.
            </p>
          </div>
        ),
      },
      {
        id: "track-order",
        question: "How can I track my order?",
        answer: (
          <p>
            Once your order is processed and dispatched, you will receive courier
            tracking details. You can also view your active and past orders from
            your{" "}
            <Link
              href="/dashboard"
              className="text-foreground underline underline-offset-2"
            >
              Order Dashboard
            </Link>{" "}
            or contact our customer care team with your Order ID.
          </p>
        ),
      },
      {
        id: "return-policy",
        question: "What is your return and exchange policy?",
        answer: (
          <p>
            We want you to be completely happy with your purchase. If you
            experience sizing issues or receive a defective or incorrect item, you
            can request an exchange or return within 48 hours of delivery. Learn
            more on our{" "}
            <Link
              href="/returns"
              className="text-foreground underline underline-offset-2"
            >
              Returns &amp; Exchange Policy
            </Link>{" "}
            page.
          </p>
        ),
      },
      {
        id: "size-guide",
        question: "How do I choose the right size?",
        answer: (
          <p>
            Detailed measurements and fit guidelines are available on each
            product page as well as on our dedicated{" "}
            <Link
              href="/size-chart"
              className="text-foreground underline underline-offset-2"
            >
              Size Chart
            </Link>{" "}
            page. If you are unsure between two sizes, feel free to contact us
            for assistance.
          </p>
        ),
      },
      {
        id: "contact-support",
        question: "How can I contact customer support?",
        answer: (
          <div className="space-y-2">
            <p>Our customer care team is here to assist you:</p>
            <ul className="list-disc space-y-1 pl-5">
              {storePhone && (
                <li>
                  <strong>Phone:</strong>{" "}
                  <a
                    href={`tel:${storePhone.replace(/-/g, "")}`}
                    className="text-foreground underline underline-offset-2"
                  >
                    {storePhone}
                  </a>
                </li>
              )}
              {storeEmail && (
                <li>
                  <strong>Email:</strong>{" "}
                  <a
                    href={`mailto:${storeEmail}`}
                    className="text-foreground underline underline-offset-2"
                  >
                    {storeEmail}
                  </a>
                </li>
              )}
              {storeHours && (
                <li>
                  <strong>Timings:</strong> {storeHours}
                </li>
              )}
            </ul>
            <p>
              You can also reach us through our{" "}
              <Link
                href="/contact"
                className="text-foreground underline underline-offset-2"
              >
                Contact Us
              </Link>{" "}
              page.
            </p>
          </div>
        ),
      },
    ],
    [storeAddress, storeEmail, storeHours, storePhone, shippingPrice, categoryList],
  );

  const faqs: FaqItem[] = useMemo(() => {
    if (initialFaqs && initialFaqs.length > 0) {
      return initialFaqs.map((item) => {
        const isProductQuestion =
          item.question.toLowerCase().includes("what products") ||
          item.question.toLowerCase().includes("products do you have");

        if (isProductQuestion && categoryList.length > 0) {
          return {
            id: `faq-${item.id}`,
            question: item.question,
            answer: (
              <div className="space-y-2">
                <p>{item.answer}</p>
                <ul className="list-disc space-y-1 pl-5">
                  {categoryList.map((cat) => {
                    const href = `/${cat.name.toLowerCase().trim().replace(/\s+/g, "-")}`;
                    return (
                      <li key={cat.id}>
                        <Link
                          href={href}
                          className="text-foreground underline underline-offset-2"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ),
            category: item.category || undefined,
          };
        }

        return {
          id: `faq-${item.id}`,
          question: item.question,
          answer: <p>{item.answer}</p>,
          category: item.category || undefined,
        };
      });
    }
    return defaultFaqs;
  }, [initialFaqs, defaultFaqs, categoryList]);

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return faqs;

    return faqs.filter((faq) => {
      const qMatch = faq.question.toLowerCase().includes(query);
      const catMatch = faq.category?.toLowerCase().includes(query);
      return qMatch || catMatch;
    });
  }, [faqs, searchQuery]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="bg-background min-h-[60vh] py-10 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="text-foreground mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
          FAQs
        </h1>

        {/* Search Input matching Screenshot */}
        <div className="relative mb-8">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
            placeholder="Search FAQs"
            className="h-12 text-base"
          />
        </div>

        {/* FAQ Accordion List with Smooth Animated Transitions */}
        {filteredFaqs.length > 0 ? (
          <div className="divide-y divide-border/60 border-t border-border/60">
            {filteredFaqs.map((faq) => {
              const isOpen = Boolean(openIds[faq.id]);
              return (
                <div key={faq.id} className="overflow-hidden transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleItem(faq.id)}
                    className="hover:text-foreground group flex w-full items-center justify-between gap-4 py-5 text-left transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-foreground text-base font-normal sm:text-lg">
                      {faq.question}
                    </span>
                    <span className="text-muted-foreground group-hover:text-foreground shrink-0 transition-transform duration-200">
                      {isOpen ? (
                        <Minus className="size-4" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                          transition: {
                            height: { duration: 0.28, ease: [0.04, 0.62, 0.23, 0.98] },
                            opacity: { duration: 0.2, delay: 0.05 },
                          },
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                          transition: {
                            height: { duration: 0.22, ease: [0.04, 0.62, 0.23, 0.98] },
                            opacity: { duration: 0.15 },
                          },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="text-muted-foreground pb-5 text-sm leading-relaxed sm:text-base">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border-border/60 rounded-lg border border-dashed py-12 text-center">
            <p className="text-muted-foreground text-sm sm:text-base">
              No FAQs found matching &quot;{searchQuery}&quot;
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="mt-4"
            >
              Clear search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
