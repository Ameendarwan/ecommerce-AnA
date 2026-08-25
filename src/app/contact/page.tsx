import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { pageMetadata, SITE } from "@/lib/seo";
import { getStoreSettingsServer } from "@/services/settings/getStoreSettingsServer";
import { toStoreContact } from "@/lib/storeSettingsDefaults";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description: `Get in touch with ${SITE.name} — phone, email, and store hours.`,
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getStoreSettingsServer();
  const store = toStoreContact(settings);

  return (
    <ContentPage
      title="Contact Us"
      description="We're here to help with orders, sizing, returns, and anything else."
    >
      <h2>Reach us</h2>
      <ul>
        {store.phone && (
          <li>
            <strong>Phone:</strong>{" "}
            <a href={`tel:${store.phone.replace(/-/g, "")}`}>{store.phone}</a>
          </li>
        )}
        {store.email && (
          <li>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${store.email}`}>{store.email}</a>
          </li>
        )}
        {store.address && (
          <li>
            <strong>Address:</strong> {store.address}
          </li>
        )}
        {store.hours && (
          <li>
            <strong>Hours:</strong> {store.hours}
          </li>
        )}
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
        {store.socials.instagram && (
          <>
            <a
              href={store.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
            ,{" "}
          </>
        )}
        {store.socials.tiktok && (
          <>
            <a
              href={store.socials.tiktok}
              target="_blank"
              rel="noopener noreferrer"
            >
              TikTok
            </a>
            ,{" "}
          </>
        )}
        {store.socials.facebook && (
          <>
            <a
              href={store.socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
            , and{" "}
          </>
        )}
        {store.socials.youtube && (
          <a
            href={store.socials.youtube}
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube
          </a>
        )}
        .
      </p>
    </ContentPage>
  );
}
