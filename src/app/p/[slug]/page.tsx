import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/ContentPage";
import { pageMetadata, SITE } from "@/lib/seo";
import { pageService } from "@/services/page/pageService";

interface CustomPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CustomPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await pageService.getPageBySlug(slug);

  if (!page) {
    return pageMetadata({
      title: "Page Not Found",
      description: "The requested page does not exist.",
      path: `/p/${slug}`,
    });
  }

  return pageMetadata({
    title: page.seo_title || page.title,
    description:
      page.seo_description ||
      `${page.title} — ${SITE.name}`,
    path: `/p/${slug}`,
  });
}

export default async function CustomPage({ params }: CustomPageProps) {
  const { slug } = await params;
  const page = await pageService.getPageBySlug(slug);

  if (!page || !page.is_published) {
    notFound();
  }

  return (
    <ContentPage
      title={page.title}
      description={page.seo_description || undefined}
      htmlContent={page.content}
    />
  );
}
