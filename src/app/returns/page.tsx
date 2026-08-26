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
      <h2>Our policy</h2>
      <p>
        Returns are considered only when an item has a genuine defect or damage
        — and the request must be made on the{" "}
        <strong>same day you receive your order</strong>.
      </p>

      <h2>Eligibility</h2>
      <ul>
        <li>
          The item must have a clear defect or damage (e.g. torn fabric, broken
          hardware, wrong item sent, or a fault not described on the product
          page).
        </li>
        <li>
          Contact us on the <strong>same day of delivery</strong> with your
          order ID and clear photos of the issue.
        </li>
        <li>
          Items must be unused, unwashed, and in the condition received, with
          tags attached where applicable.
        </li>
        <li>
          Change-of-mind returns, size swaps after delivery, and requests made
          after the delivery day are not accepted.
        </li>
        <li>
          Final-sale, clearance, or heavily discounted items may not be eligible
          — we&apos;ll note this on the product page when applicable.
        </li>
      </ul>

      <h2>Exchanges</h2>
      <p>
        Exchanges are only considered for same-day defect or damage claims, and
        only when we have a suitable replacement in stock. If an exchange is not
        possible, we may offer a refund instead.
      </p>

      <h2>How to request a return</h2>
      <ol>
        <li>
          On the day your order arrives, message or email us at{" "}
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
        <li>
          Share your order ID, describe the defect, and send photos if requested.
        </li>
        <li>
          Once approved, we&apos;ll guide you on pickup or drop-off and process
          your refund or exchange.
        </li>
      </ol>

      <h2>Refunds</h2>
      <p>
        Approved refunds are typically processed after we receive and inspect the
        returned item. Shipping fees are generally non-refundable unless the
        return is due to our error (wrong or defective item).
      </p>

      <p>
        Questions? See <Link href="/contact">Contact us</Link> or read our{" "}
        <Link href="/shipping-policy">Shipping Policy</Link>.
      </p>
    </ContentPage>
  );
}
