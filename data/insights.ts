import {
  getPublishedBlogBySlug,
  getPublishedBlogSlugRows,
  getPublishedBlogSlugs,
  getPublishedBlogs,
  getRelatedPublishedBlogs,
} from "@/data/blogs";
import type { Locale } from "@/constants/locales";
import { insightPath } from "@/constants/routes";
import { toArticle, toArticleList } from "@/types/blog";
import type { Article, ArticleListItem } from "@/types/article";
import type { BlogSlugRow } from "@/types/blog";

export type InsightsIndex = {
  articles: ArticleListItem[];
  featured?: ArticleListItem;
};

/**
 * Everything the Insights index renders, from a single published-blogs read.
 * `is_featured` already travels with the list columns, so the featured post is
 * picked in memory instead of costing a second query.
 */
export async function getInsightsIndex(
  locale: Locale = "en",
): Promise<InsightsIndex> {
  const blogs = await getPublishedBlogs();

  // At most one row can be featured (`blogs_one_featured_uidx`); newest
  // published post is the fallback so the hero slot is never empty.
  const featured = blogs.find((blog) => blog.is_featured) ?? blogs[0];

  return {
    articles: blogs.map((blog) => toArticleList(blog, locale)),
    featured: featured ? toArticleList(featured, locale) : undefined,
  };
}

export async function getInsightSlugs(): Promise<string[]> {
  return getPublishedBlogSlugs();
}

export async function getInsightSlugRows(): Promise<BlogSlugRow[]> {
  return getPublishedBlogSlugRows();
}

export async function getInsightBySlug(
  slug: string,
  locale: Locale = "en",
): Promise<Article | undefined> {
  const blog = await getPublishedBlogBySlug(slug);
  return blog ? toArticle(blog, locale) : undefined;
}

export async function getRelatedInsights(
  slug: string,
  limit = 3,
  locale: Locale = "en",
): Promise<ArticleListItem[]> {
  const related = await getRelatedPublishedBlogs(slug, limit);
  return related.map((blog) => toArticleList(blog, locale));
}

export function insightHref(locale: Locale, slug: string): string {
  return insightPath(locale, slug);
}
