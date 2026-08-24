import { notFound } from "next/navigation";

import {
  InsightDetailPage,
  insightDetailLabelsFor,
} from "@/components/marketing/insight-detail-page";
import { blogLabelsFor } from "@/components/marketing/blog-labels";
import { getInsightBySlug, getInsightSlugs } from "@/data/insights";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getInsightSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = getInsightBySlug(slug);

  if (!article) {
    return { title: "Insight not found — ASIP" };
  }

  return buildMarketingMetadata({
    locale: "en",
    path: `/insights/${slug}`,
    title: `${article.title} — ASIP`,
    description: article.summary,
  });
}

export default async function EnInsightDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = getInsightBySlug(slug);

  if (!article) notFound();

  return (
    <InsightDetailPage
      locale="en"
      article={article}
      labels={insightDetailLabelsFor("en", blogLabelsFor("en"))}
    />
  );
}
