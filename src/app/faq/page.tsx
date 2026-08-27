import type { Metadata } from "next";
import { pageMetadata, SITE, JsonLd } from "@/lib/seo";
import { getStoreSettingsServer } from "@/services/settings/getStoreSettingsServer";
import { toStoreContact } from "@/lib/storeSettingsDefaults";
import { faqService } from "@/services/faq/faqService";
import { getCategoriesServer } from "@/services/category/getCategoriesServer";
import { FaqClient } from "./FaqClient";

export const metadata: Metadata = pageMetadata({
  title: "Frequently Asked Questions (FAQs)",
  description: `Find answers to common questions about orders, shipping, payment, returns, and delivery at ${SITE.name}.`,
  path: "/faq",
});

export default async function FaqPage() {
  const [settings, publishedFaqs, categories] = await Promise.all([
    getStoreSettingsServer(),
    faqService.getPublishedFaqs(),
    getCategoriesServer(),
  ]);

  const store = toStoreContact(settings);

  const mainEntity =
    publishedFaqs.length > 0
      ? publishedFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        }))
      : [
          {
            "@type": "Question",
            name: `What is ${SITE.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${SITE.name} is your premier online destination for curated fashion, apparel, shoes, bags, and everyday lifestyle essentials.`,
            },
          },
          {
            "@type": "Question",
            name: "What payment options are available?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "We offer Cash on Delivery (COD) nationwide across Pakistan.",
            },
          },
        ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <FaqClient
        initialFaqs={publishedFaqs}
        initialCategories={categories}
        storePhone={store.phone}
        storeEmail={store.email}
        storeAddress={store.address}
        storeHours={store.hours}
        shippingPrice={store.shippingPrice}
      />
    </>
  );
}
