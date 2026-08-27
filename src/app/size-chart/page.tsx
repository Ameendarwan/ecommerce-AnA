import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { pageMetadata, SITE } from "@/lib/seo";
import { pageService } from "@/services/page/pageService";

export async function generateMetadata(): Promise<Metadata> {
  const page = await pageService.getPageBySlug("size-chart");
  return pageMetadata({
    title: page?.seo_title || page?.title || "Size Chart",
    description:
      page?.seo_description ||
      `Find your fit with the ${SITE.name} size chart for shirts and clothing.`,
    path: "/size-chart",
  });
}

const shirtSizes = [
  { size: "S", chest: "36–38", length: "27", shoulder: "16.5" },
  { size: "M", chest: "38–40", length: "28", shoulder: "17.5" },
  { size: "L", chest: "40–42", length: "29", shoulder: "18.5" },
  { size: "XL", chest: "42–44", length: "30", shoulder: "19.5" },
  { size: "XXL", chest: "44–46", length: "31", shoulder: "20.5" },
] as const;

export default async function SizeChartPage() {
  const page = await pageService.getPageBySlug("size-chart");

  if (page && page.content) {
    return (
      <ContentPage
        title={page.title}
        description={
          page.seo_description ||
          "Use this guide as a starting point. Actual measurements can vary slightly by style and brand."
        }
        htmlContent={page.content}
      />
    );
  }

  return (
    <ContentPage
      title="Size Chart"
      description="Use this guide as a starting point. Actual measurements can vary slightly by style and brand."
    >
      <h2>How to measure</h2>
      <ul>
        <li>
          <strong>Chest</strong> — measure around the fullest part of your chest,
          under the arms.
        </li>
        <li>
          <strong>Length</strong> — from the highest point of the shoulder down
          to the hem.
        </li>
        <li>
          <strong>Shoulder</strong> — from shoulder seam to shoulder seam across
          the back.
        </li>
      </ul>

      <h2>Shirts & tops (inches)</h2>
      <div className="overflow-x-auto">
        <table className="border-border text-foreground w-full min-w-[320px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-border border-b">
              <th className="px-3 py-2 font-semibold">Size</th>
              <th className="px-3 py-2 font-semibold">Chest</th>
              <th className="px-3 py-2 font-semibold">Length</th>
              <th className="px-3 py-2 font-semibold">Shoulder</th>
            </tr>
          </thead>
          <tbody>
            {shirtSizes.map((row) => (
              <tr key={row.size} className="border-border border-b">
                <td className="px-3 py-2">{row.size}</td>
                <td className="text-muted-foreground px-3 py-2">{row.chest}</td>
                <td className="text-muted-foreground px-3 py-2">{row.length}</td>
                <td className="text-muted-foreground px-3 py-2">
                  {row.shoulder}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Shoes & other items</h2>
      <p>
        Shoe and accessory sizing follows the labels listed on each product
        page. If you&apos;re between sizes or unsure,{" "}
        <Link href="/contact">contact us</Link> before ordering — we&apos;re
        happy to help you pick the right fit.
      </p>

      <p className="text-muted-foreground text-sm">
        Note: This chart is a general guide. Product descriptions may include
        more specific measurements.
      </p>
    </ContentPage>
  );
}
