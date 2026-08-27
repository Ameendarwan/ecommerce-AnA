import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { pageMetadata, SITE } from "@/lib/seo";
import { pageService } from "@/services/page/pageService";
import { getCategoriesServer } from "@/services/category/getCategoriesServer";

export async function generateMetadata(): Promise<Metadata> {
  const page = await pageService.getPageBySlug("about");
  return pageMetadata({
    title: page?.seo_title || page?.title || "About Us",
    description:
      page?.seo_description ||
      `Learn about ${SITE.name} — style for less, quality for more.`,
    path: "/about",
  });
}

export default async function AboutPage() {
  const [page, categories] = await Promise.all([
    pageService.getPageBySlug("about"),
    getCategoriesServer(),
  ]);

  if (page && page.content) {
    return (
      <ContentPage
        title={page.title}
        description={page.seo_description || `${SITE.name} — style for less, quality for more.`}
        htmlContent={page.content}
      />
    );
  }

  const categoryList =
    categories && categories.length > 0
      ? categories
      : [
          { id: 1, name: "Shirts" },
          { id: 2, name: "Clothing" },
          { id: 3, name: "Shoes" },
          { id: 4, name: "Bags" },
          { id: 5, name: "Accessories" },
          { id: 6, name: "Electronics" },
        ];

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
        Explore{" "}
        {categoryList.map((cat, idx) => {
          const isLast = idx === categoryList.length - 1;
          const isSecondLast = idx === categoryList.length - 2;
          const href = `/${cat.name.toLowerCase().trim().replace(/\s+/g, "-")}`;
          return (
            <span key={cat.id}>
              <Link
                href={href}
                className="text-foreground underline underline-offset-2"
              >
                {cat.name.toLowerCase()}
              </Link>
              {isSecondLast ? ", and " : !isLast ? ", " : ""}
            </span>
          );
        })}{" "}
        — all in one place.
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
