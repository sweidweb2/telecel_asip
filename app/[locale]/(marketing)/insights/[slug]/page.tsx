import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  InsightDetailPage,
  insightDetailLabelsFor,
} from "@/components/marketing/insight-detail-page";
import { blogLabelsFor } from "@/components/marketing/blog-labels";
import {
  getInsightBySlug,
  getInsightSlugs,
  getRelatedInsights,
} from "@/data/insights";
import { localeFromParams } from "@/lib/i18n/locale-params";
import { safePrerenderList } from "@/lib/prerender-safe";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await safePrerenderList("insight slugs", () => getInsightSlugs());
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await localeFromParams(params);
  const { slug } = await params;
  const article = await getInsightBySlug(slug, locale);

  if (!article) {
    return {
      title:
        locale === "fr"
          ? "Perspective introuvable | ASIP"
          : "Insight not found | ASIP",
    };
  }

  return buildMarketingMetadata({
    locale,
    path: `/insights/${slug}`,
    title: `${article.metaTitle ?? article.title} | ASIP`,
    description: article.metaDescription ?? article.summary,
    image: article.thumbnailUrl || undefined,
    ogType: "article",
  });
}

export default async function InsightDetailRoute({ params }: PageProps) {
  const locale = await localeFromParams(params);
  const { slug } = await params;
  const [article, related] = await Promise.all([
    getInsightBySlug(slug, locale),
    getRelatedInsights(slug, 3, locale),
  ]);

  if (!article) notFound();

  return (
    <InsightDetailPage
      locale={locale}
      article={article}
      related={related}
      labels={insightDetailLabelsFor(locale, blogLabelsFor(locale))}
    />
  );
}
