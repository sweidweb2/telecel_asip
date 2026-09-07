import { BLOG_STREAM_CATEGORY_LABELS } from "@/constants/blog-ui";

/**
 * Recommended primary categories for the Insights public stream filters.
 * First category on a post drives listing tabs when it matches one of these.
 */
export const RECOMMENDED_BLOG_CATEGORIES = [
  BLOG_STREAM_CATEGORY_LABELS["founder-stories"],
  BLOG_STREAM_CATEGORY_LABELS["portfolio-news"],
  BLOG_STREAM_CATEGORY_LABELS["programme-updates"],
  BLOG_STREAM_CATEGORY_LABELS["founder-resources"],
  BLOG_STREAM_CATEGORY_LABELS["partner-perspectives"],
] as const;

export type RecommendedBlogCategory =
  (typeof RECOMMENDED_BLOG_CATEGORIES)[number];
