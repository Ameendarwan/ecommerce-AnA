import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { pageMetadata, SITE } from "@/lib/seo";
import { STORE_COUNTRY } from "@/lib/shipping";
import { formatCurrency } from "@/utils/formatCurrency";
import { getStoreSettingsServer } from "@/services/settings/getStoreSettingsServer";
import { pageService } from "@/services/page/pageService";

export async function generateMetadata(): Promise<Metadata> {
  const page = await pageService.getPageBySlug("shipping-policy");
  return pageMetadata({
    title: page?.seo_title || page?.title || "Shipping Policy",
    description:
      page?.seo_description ||
      `Shipping rates and delivery info for ${SITE.name} orders across ${STORE_COUNTRY}.`,
    path: "/shipping-policy",
  });
}

export default async function ShippingPolicyPage() {
  const [settings, page] = await Promise.all([
    getStoreSettingsServer(),
    pageService.getPageBySlug("shipping-policy"),
  ]);

  if (page && page.content) {
    return (
      <ContentPage
        title={page.title}
        description={page.seo_description || `How we deliver ${SITE.name} orders across ${STORE_COUNTRY}.`}
        htmlContent={page.content}
      />
    );
  }

  return (
    <ContentPage
      title="Shipping Policy"
      description={`How we deliver ${SITE.name} orders across ${STORE_COUNTRY}.`}
    >
      <h2>Coverage</h2>
      <p>
        We currently ship nationwide within <strong>{STORE_COUNTRY}</strong>.
        Delivery times may vary by city and courier availability.
      </p>

      <h2>Shipping fee</h2>
      <p>
        A flat shipping fee of{" "}
        <strong>{formatCurrency(settings.shipping_price)}</strong> applies to
        standard cash-on-delivery orders. The fee is shown at checkout before
        you place your order.
      </p>

      <h2>Estimated delivery</h2>
      <ul>
        <li>
          <strong>Major cities</strong> — typically 2–5 business days after
          confirmation.
        </li>
        <li>
          <strong>Other areas</strong> — typically 3–7 business days, depending
          on location.
        </li>
      </ul>
      <p>
        Delays can occur during peak seasons, public holidays, or courier
        disruptions. We&apos;ll do our best to keep you updated.
      </p>

      <h2>Order confirmation</h2>
      <p>
        After you place an order, we may contact you by phone to confirm details
        before dispatch. Please keep your phone reachable.
      </p>

      <h2>Damaged or missing items</h2>
      <p>
        If something arrives damaged or incomplete, contact us within 48 hours
        of delivery with your order ID and photos. See our{" "}
        <Link href="/returns">Returns &amp; Exchange Policy</Link> for next
        steps.
      </p>

      <p>
        Need help? <Link href="/contact">Contact us</Link>.
      </p>
    </ContentPage>
  );
}
