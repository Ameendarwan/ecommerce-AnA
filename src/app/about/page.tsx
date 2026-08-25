import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description: `Learn about ${SITE.name} — style for less, quality for more.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <ContentPage
      title="About Us"
      description={`${SITE.name} — style for less, quality for more.`}
    >
      <p>
        Welcome to <strong>{SITE.name}</strong>, your go-to destination for
        curated fashion and everyday essentials at prices that make sense. We
        believe great style shouldn&apos;t cost a fortune — so we carefully
        select shirts, clothing, shoes, bags, accessories, and more so you can
        refresh your wardrobe without overspending.
      </p>

      <h2>What we stand for</h2>
      <ul>
        <li>
          <strong>Quality you can trust</strong> — every piece is reviewed so
          you get value that lasts.
        </li>
        <li>
          <strong>Style for less</strong> — trendy looks and timeless basics at
          thrift-friendly prices.
        </li>
        <li>
          <strong>Hassle-free shopping</strong> — browse online, order with
          cash on delivery across Pakistan, and get your finds delivered to your
          door.
        </li>
      </ul>

      <h2>Our categories</h2>
      <p>
        Explore <Link href="/shirts">shirts</Link>,{" "}
        <Link href="/clothing">clothing</Link>,{" "}
        <Link href="/shoes">shoes</Link>, <Link href="/bags">bags</Link>,{" "}
        <Link href="/accessories">accessories</Link>, and{" "}
        <Link href="/electronics">electronics</Link> — all in one place.
      </p>

      <h2>Questions?</h2>
      <p>
        We&apos;d love to hear from you. Visit our{" "}
        <Link href="/contact">Contact</Link> page or reach out via the details
        in the footer.
      </p>
    </ContentPage>
  );
}
