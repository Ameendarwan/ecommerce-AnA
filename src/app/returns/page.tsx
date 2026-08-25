import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { pageMetadata, SITE } from "@/lib/seo";
import { getStoreSettingsServer } from "@/services/settings/getStoreSettingsServer";
import { toStoreContact } from "@/lib/storeSettingsDefaults";

export const metadata: Metadata = pageMetadata({
  title: "Returns & Exchange Policy",
  description: `Returns and exchanges at ${SITE.name} — how to request a return or size exchange.`,
  path: "/returns",
});

export default async function ReturnsPage() {
  const settings = await getStoreSettingsServer();
  const store = toStoreContact(settings);

  return (
    <ContentPage
      title="Returns & Exchange Policy"
      description="We want you to love what you ordered. Here's how returns and exchanges work."
    >
      <h2>Eligibility</h2>
      <ul>
        <li>
          Items must be unused, unwashed, and in original condition with tags
          attached (where applicable).
        </li>
        <li>
          Please initiate a return or exchange request within{" "}
          <strong>7 days</strong> of delivery.
        </li>
        <li>
          Final-sale, clearance, or heavily discounted items may not be eligible
          — we&apos;ll note this on the product page when applicable.
        </li>
      </ul>

      <h2>Exchanges</h2>
      <p>
        Need a different size or colour? Contact us with your order ID and the
        item you&apos;d like instead. Exchanges depend on stock availability.
      </p>

      <h2>How to request a return</h2>
      <ol>
        <li>
          Message or email us at{" "}
          <a href={`mailto:${store.email}`}>{store.email}</a>
          {store.phone && (
            <>
              {" "}
              or call{" "}
              <a href={`tel:${store.phone.replace(/-/g, "")}`}>
                {store.phone}
              </a>
            </>
          )}
          .
        </li>
        <li>Share your order ID, reason for return, and photos if requested.</li>
        <li>
          Once approved, we&apos;ll guide you on pickup or drop-off and process
          your refund or exchange.
        </li>
      </ol>

      <h2>Refunds</h2>
      <p>
        Approved refunds are typically processed after we receive and inspect the
        returned item. Shipping fees are generally non-refundable unless the
        return is due to our error (wrong or damaged item).
      </p>

      <p>
        Questions? See <Link href="/contact">Contact us</Link> or read our{" "}
        <Link href="/shipping-policy">Shipping Policy</Link>.
      </p>
    </ContentPage>
  );
}
