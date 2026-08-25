import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { pageMetadata, SITE } from "@/lib/seo";
import { SHIPPING_PKR, STORE_COUNTRY, STORE_CURRENCY } from "@/lib/shipping";
import { formatCurrency } from "@/utils/formatCurrency";

export const metadata: Metadata = pageMetadata({
  title: "Payment Options",
  description: `How to pay for ${SITE.name} orders — cash on delivery and more.`,
  path: "/payment-options",
});

export default function PaymentOptionsPage() {
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
          <strong>{formatCurrency(SHIPPING_PKR)}</strong>.
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
