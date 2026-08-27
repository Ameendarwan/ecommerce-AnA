import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { pageMetadata, SITE } from "@/lib/seo";
import { STORE_COUNTRY, STORE_CURRENCY } from "@/lib/shipping";
import { formatCurrency } from "@/utils/formatCurrency";
import { getStoreSettingsServer } from "@/services/settings/getStoreSettingsServer";
import { pageService } from "@/services/page/pageService";

export async function generateMetadata(): Promise<Metadata> {
  const page = await pageService.getPageBySlug("payment-options");
  return pageMetadata({
    title: page?.seo_title || page?.title || "Payment Options",
    description:
      page?.seo_description ||
      `How to pay for ${SITE.name} orders — cash on delivery and more.`,
    path: "/payment-options",
  });
}

export default async function PaymentOptionsPage() {
  const [settings, page] = await Promise.all([
    getStoreSettingsServer(),
    pageService.getPageBySlug("payment-options"),
  ]);

  if (page && page.content) {
    return (
      <ContentPage
        title={page.title}
        description={page.seo_description || `Simple, secure ways to pay for your ${SITE.name} order.`}
        htmlContent={page.content}
      />
    );
  }

  return (
    <ContentPage
      title="Payment Options"
      description={`Simple, secure ways to pay for your ${SITE.name} order.`}
    >
      <h2>Cash on Delivery (COD)</h2>
      <p>
        Pay in cash when your order arrives. COD is available for deliveries
        across <strong>{STORE_COUNTRY}</strong>. Please have the exact order
        total ready for the courier when possible.
      </p>
      <ul>
        <li>
          Order total includes product prices plus a flat shipping fee of{" "}
          <strong>{formatCurrency(settings.shipping_price)}</strong>.
        </li>
        <li>
          All prices are shown in <strong>{STORE_CURRENCY}</strong>.
        </li>
        <li>
          We may call to confirm your order before shipping — please answer so
          we can dispatch quickly.
        </li>
      </ul>

      <h2>Other methods</h2>
      <p>
        Online card or wallet payments may be added in the future. For now, COD
        is our primary payment method at checkout.
      </p>

      <h2>Security</h2>
      <p>
        We never ask for your bank PIN, OTP, or full card details over phone or
        social media. If anything seems suspicious, contact us through the
        official channels on our <Link href="/contact">Contact</Link> page.
      </p>

      <p>
        Related: <Link href="/shipping-policy">Shipping Policy</Link> ·{" "}
        <Link href="/returns">Returns &amp; Exchange</Link>
      </p>
    </ContentPage>
  );
}
