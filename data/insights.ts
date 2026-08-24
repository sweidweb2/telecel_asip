import type { Locale } from "@/constants/locales";
import {
  BLOG_ARTICLES,
  FEATURED_ARTICLE,
} from "@/constants/blog-articles";
import { insightPath } from "@/constants/routes";
import type { Article } from "@/types/article";

const ALL_INSIGHTS: Article[] = [FEATURED_ARTICLE, ...BLOG_ARTICLES];

export function getAllInsights(): Article[] {
  return ALL_INSIGHTS;
}

export function getInsightSlugs(): string[] {
  return ALL_INSIGHTS.map((article) => article.slug);
}

export function getInsightBySlug(slug: string): Article | undefined {
  return ALL_INSIGHTS.find((article) => article.slug === slug);
}

export function getRelatedInsights(slug: string, limit = 3): Article[] {
  const current = getInsightBySlug(slug);
  if (!current) return BLOG_ARTICLES.slice(0, limit);

  return BLOG_ARTICLES.filter(
    (article) =>
      article.slug !== slug &&
      article.category.name === current.category.name,
  ).slice(0, limit);
}

export function insightHref(locale: Locale, slug: string): string {
  return insightPath(locale, slug);
}
