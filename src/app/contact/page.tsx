import type { Metadata } from "next";
import { pageMetadata, SITE } from "@/lib/seo";
import { getStoreSettingsServer } from "@/services/settings/getStoreSettingsServer";
import { toStoreContact } from "@/lib/storeSettingsDefaults";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description: `Get in touch with ${SITE.name} — send us a message or reach out by phone or email.`,
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getStoreSettingsServer();
  const store = toStoreContact(settings);

  return (
    <ContactForm
      storePhone={store.phone}
      storeEmail={store.email}
      storeAddress={store.address}
      storeHours={store.hours}
    />
  );
}
