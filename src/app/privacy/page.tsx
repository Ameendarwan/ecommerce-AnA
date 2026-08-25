import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { pageMetadata, SITE } from "@/lib/seo";
import { getStoreSettingsServer } from "@/services/settings/getStoreSettingsServer";
import { toStoreContact } from "@/lib/storeSettingsDefaults";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${SITE.name} collects, uses, and protects your personal information.`,
  path: "/privacy",
});

export default async function PrivacyPage() {
  const settings = await getStoreSettingsServer();
  const store = toStoreContact(settings);

  return (
    <ContentPage
      title="Privacy Policy"
      description={`Last updated: ${new Date().toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}`}
    >
      <p>
        At <strong>{SITE.name}</strong>, we respect your privacy. This policy
        explains what information we collect when you use{" "}
        <a href={SITE.url}>{SITE.url}</a> and how we use it.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account details</strong> — name, email, and password when you
          sign up.
        </li>
        <li>
          <strong>Order details</strong> — shipping address, phone number, and
          order contents needed to fulfil your purchase.
        </li>
        <li>
          <strong>Usage data</strong> — basic analytics such as pages visited
          and device type to improve the site.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>Process and deliver orders (including cash on delivery).</li>
        <li>Respond to support requests and returns.</li>
        <li>Improve our products, site experience, and security.</li>
        <li>Send important order updates (not spam).</li>
      </ul>

      <h2>Sharing</h2>
      <p>
        We do not sell your personal data. We may share limited information with
        trusted partners only as needed to operate the store (for example,
        delivery partners or payment processors), or when required by law.
      </p>

      <h2>Data security</h2>
      <p>
        We use industry-standard practices to protect your account and order
        data. No method of transmission over the internet is 100% secure, but we
        work to keep your information safe.
      </p>

      <h2>Your choices</h2>
      <p>
        You can update your profile details while signed in, or contact us to
        request correction or deletion of personal data where applicable.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email{" "}
        <a href={`mailto:${store.email}`}>{store.email}</a> or visit{" "}
        <Link href="/contact">Contact us</Link>.
      </p>
    </ContentPage>
  );
}
