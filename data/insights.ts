import {
  getFeaturedBlog,
  getPublishedBlogBySlug,
  getPublishedBlogSlugs,
  getPublishedBlogs,
  getRelatedPublishedBlogs,
} from "@/data/blogs";
import type { Locale } from "@/constants/locales";
import { insightPath } from "@/constants/routes";
import { toArticle } from "@/types/blog";
import type { Article } from "@/types/article";

export async function getAllInsights(locale: Locale = "en"): Promise<Article[]> {
  const blogs = await getPublishedBlogs();
  return blogs.map((blog) => toArticle(blog, locale));
}

export async function getInsightSlugs(): Promise<string[]> {
  return getPublishedBlogSlugs();
}

export async function getInsightBySlug(
  slug: string,
  locale: Locale = "en",
): Promise<Article | undefined> {
  const blog = await getPublishedBlogBySlug(slug);
  return blog ? toArticle(blog, locale) : undefined;
}

export async function getFeaturedInsight(
  locale: Locale = "en",
): Promise<Article | undefined> {
  const featured = await getFeaturedBlog();
  if (featured) return toArticle(featured, locale);

  const blogs = await getPublishedBlogs();
  const first = blogs[0];
  return first ? toArticle(first, locale) : undefined;
}

export async function getRelatedInsights(
  slug: string,
  limit = 3,
  locale: Locale = "en",
): Promise<Article[]> {
  const related = await getRelatedPublishedBlogs(slug, limit);
  return related.map((blog) => toArticle(blog, locale));
}

export function insightHref(locale: Locale, slug: string): string {
  return insightPath(locale, slug);
}
