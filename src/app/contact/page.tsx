import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { pageMetadata, SITE } from "@/lib/seo";
import { STORE } from "@/lib/store";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description: `Get in touch with ${SITE.name} — phone, email, and store hours.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <ContentPage
      title="Contact Us"
      description="We're here to help with orders, sizing, returns, and anything else."
    >
      <h2>Reach us</h2>
      <ul>
        <li>
          <strong>Phone:</strong>{" "}
          <a href={`tel:${STORE.phone.replace(/-/g, "")}`}>{STORE.phone}</a>
        </li>
        <li>
          <strong>Email:</strong>{" "}
          <a href={`mailto:${STORE.email}`}>{STORE.email}</a>
        </li>
        <li>
          <strong>Hours:</strong> {STORE.hours}
        </li>
      </ul>

      <h2>Order support</h2>
      <p>
        For order status, delivery updates, or product questions, message us
        with your order ID (if you have one) and we&apos;ll get back to you as
        soon as possible during business hours.
      </p>

      <h2>Social</h2>
      <p>
        Follow {SITE.name} for new drops and style inspo on{" "}
        <a href={STORE.socials.instagram} target="_blank" rel="noopener noreferrer">
          Instagram
        </a>
        ,{" "}
        <a href={STORE.socials.tiktok} target="_blank" rel="noopener noreferrer">
          TikTok
        </a>
        ,{" "}
        <a href={STORE.socials.facebook} target="_blank" rel="noopener noreferrer">
          Facebook
        </a>
        , and{" "}
        <a href={STORE.socials.youtube} target="_blank" rel="noopener noreferrer">
          YouTube
        </a>
        .
      </p>
    </ContentPage>
  );
}
