import {
  getPublishedBlogBySlug,
  getPublishedBlogSlugRows,
  getPublishedBlogSlugs,
  getPublishedBlogs,
  getRelatedPublishedBlogs,
  BLOGS_CACHE_TAG,
} from "@/data/blogs";
import { COHORTS_CACHE_TAG } from "@/data/cohorts";
import { STARTUPS_CACHE_TAG } from "@/data/startups";
import type { Locale } from "@/constants/locales";
import { insightPath } from "@/constants/routes";
import { createPublicClient } from "@/lib/supabase/public";
import { toArticle, toArticleList, type BlogRelatedLinks } from "@/types/blog";
import type { Article, ArticleListItem } from "@/types/article";
import type { BlogSlugRow } from "@/types/blog";
import { unstable_cache } from "next/cache";
import { cache } from "react";

export type InsightsIndex = {
  articles: ArticleListItem[];
  featured?: ArticleListItem;
};

export async function getLatestInsights(
  locale: Locale = "en",
  limit = 3,
): Promise<ArticleListItem[]> {
  const blogs = await getPublishedBlogs();
  return blogs.slice(0, limit).map((blog) => toArticleList(blog, locale));
}

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

async function fetchBlogRelatedLinks(
  startupId: string | null,
  cohortId: string | null,
): Promise<BlogRelatedLinks> {
  if (!startupId && !cohortId) return {};

  const supabase = createPublicClient();
  const [startupResult, cohortResult] = await Promise.all([
    startupId
      ? supabase
          .from("startups_public")
          .select("id, name, slug")
          .eq("id", startupId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    cohortId
      ? supabase
          .from("cohorts")
          .select("id, public_label")
          .eq("id", cohortId)
          .eq("publish_status", "published")
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (startupResult.error) throw startupResult.error;
  if (cohortResult.error) throw cohortResult.error;

  return {
    startup:
      startupResult.data &&
      startupResult.data.id &&
      startupResult.data.name &&
      startupResult.data.slug
        ? {
            id: startupResult.data.id,
            name: startupResult.data.name,
            slug: startupResult.data.slug,
          }
        : undefined,
    cohort: cohortResult.data
      ? {
          id: cohortResult.data.id,
          label: cohortResult.data.public_label,
        }
      : undefined,
  };
}

async function resolveBlogRelatedLinks(
  startupId: string | null,
  cohortId: string | null,
): Promise<BlogRelatedLinks> {
  if (!startupId && !cohortId) return {};

  return unstable_cache(
    () => fetchBlogRelatedLinks(startupId, cohortId),
    ["blog-related-links", startupId ?? "none", cohortId ?? "none"],
    {
      tags: [STARTUPS_CACHE_TAG, COHORTS_CACHE_TAG, BLOGS_CACHE_TAG],
      revalidate: 300,
    },
  )();
}

/** Request-memoized so generateMetadata + page share one related-links resolve. */
export const getInsightBySlug = cache(
  async (
    slug: string,
    locale: Locale = "en",
  ): Promise<Article | undefined> => {
    const blog = await getPublishedBlogBySlug(slug);
    if (!blog) return undefined;

    const related = await resolveBlogRelatedLinks(
      blog.startup_id,
      blog.cohort_id,
    );
    return toArticle(blog, locale, related);
  },
);

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
