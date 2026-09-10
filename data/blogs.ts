import { cache } from "react";
import { unstable_cache } from "next/cache";

import {
  adminListRange,
  adminListTotalPages,
  gateEditorPageData,
} from "@/lib/admin/admin-list-query";
import { countExact } from "@/lib/admin/count-exact";
import { isCurrentUserEditor } from "@/lib/admin/is-current-user-editor";
import { wrapCached } from "@/lib/admin/perf";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type {
  Blog,
  BlogListItem,
  BlogListResult,
  BlogPublicDetail,
  BlogPublicListItem,
  BlogSlugRow,
} from "@/types/blog";
import { blogIdSchema, type BlogListQuery } from "@/validations/blog";

export const BLOGS_CACHE_TAG = "blogs";

const LIST_COLUMNS =
  "id, slug, title, summary, categories, thumbnail_url, author_name, author_avatar_url, status, is_featured, reading_time_minutes, published_at, created_at, updated_at, startup_id, cohort_id, sources, meta_title, meta_description" as const;

const DETAIL_COLUMNS =
  "id, slug, title, summary, body_html, categories, thumbnail_url, author_name, author_avatar_url, status, is_featured, reading_time_minutes, published_at, created_at, updated_at, startup_id, cohort_id, sources, meta_title, meta_description" as const;

/** Public list / related / featured — no body_html. */
const PUBLIC_LIST_COLUMNS =
  "id, slug, title, summary, categories, thumbnail_url, author_name, author_avatar_url, reading_time_minutes, published_at, is_featured" as const;

/** Public detail by slug — includes body + Article gap fields + updated_at for SEO. */
const PUBLIC_DETAIL_COLUMNS =
  "id, slug, title, summary, body_html, categories, thumbnail_url, author_name, author_avatar_url, reading_time_minutes, published_at, updated_at, is_featured, startup_id, cohort_id, sources, meta_title, meta_description" as const;

const PUBLIC_SLUG_COLUMNS = "slug, updated_at" as const;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchBlogsPage(
  supabase: ServerClient,
  query: BlogListQuery,
): Promise<BlogListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("blogs")
    .select(LIST_COLUMNS, { count: "estimated" })
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (query.status !== "all") {
    request = request.eq("status", query.status);
  }

  if (query.search) {
    request = request.or(
      `title.ilike.%${query.search}%,slug.ilike.%${query.search}%,author_name.ilike.%${query.search}%`,
    );
  }

  const { data, count, error } = await request;
  if (error) throw error;

  const total = count ?? 0;
  return {
    blogs: (data ?? []) as BlogListItem[],
    total,
    totalPages: adminListTotalPages(total, query.pageSize),
  };
}

export type BlogListStats = {
  total: number;
  published: number;
  draft: number;
  featured: number;
};

async function fetchBlogListStats(
  supabase: ServerClient,
): Promise<BlogListStats> {
  const [total, published, draft, featured] = await Promise.all([
    supabase.from("blogs").select("id", { count: "exact", head: true }),
    supabase
      .from("blogs")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("blogs")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase
      .from("blogs")
      .select("id", { count: "exact", head: true })
      .eq("is_featured", true),
  ]);

  return {
    total: countExact(total),
    published: countExact(published),
    draft: countExact(draft),
    featured: countExact(featured),
  };
}

export async function getBlogsPageData(
  query: BlogListQuery,
): Promise<
  | { status: "forbidden" }
  | { status: "ok"; list: BlogListResult; stats: BlogListStats }
> {
  return gateEditorPageData(
    async (supabase) => {
      const [list, stats] = await Promise.all([
        fetchBlogsPage(supabase, query),
        fetchBlogListStats(supabase),
      ]);
      return { list, stats };
    },
    { name: "getBlogsPageData" },
  );
}

/**
 * Deduped per request: `generateMetadata` and the page body both need the same
 * blog.
 */
export const getBlogByIdForAdmin = wrapCached(
  "getBlogByIdForAdmin",
  { eventType: "data_read" },
  cache(
  async (
    id: string,
  ): Promise<
    | { status: "forbidden" }
    | { status: "not_found" }
    | { status: "ok"; blog: Blog }
  > => {
    if (!blogIdSchema.safeParse(id).success) return { status: "not_found" };

    const supabase = await createClient();
    if (!(await isCurrentUserEditor())) return { status: "forbidden" };

    const { data, error } = await supabase
      .from("blogs")
      .select(DETAIL_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { status: "not_found" };
    return { status: "ok", blog: data as Blog };
  },
  ),
);

async function fetchPublishedBlogs(): Promise<BlogPublicListItem[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blogs")
    .select(PUBLIC_LIST_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []) as BlogPublicListItem[];
}

async function fetchPublishedBlogBySlug(
  slug: string,
): Promise<BlogPublicDetail | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blogs")
    .select(PUBLIC_DETAIL_COLUMNS)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return (data as BlogPublicDetail | null) ?? null;
}

async function fetchPublishedBlogSlugRows(): Promise<BlogSlugRow[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blogs")
    .select(PUBLIC_SLUG_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return (data ?? []) as BlogSlugRow[];
}

/**
 * Same-category posts first, topped up by recency — ranked in one statement by
 * `get_related_published_blogs` rather than up to three sequential queries.
 */
async function fetchRelatedPublishedBlogs(
  slug: string,
  limit: number,
): Promise<BlogPublicListItem[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase.rpc("get_related_published_blogs", {
    p_slug: slug,
    p_limit: limit,
  });

  if (error) throw error;
  return (data ?? []) as BlogPublicListItem[];
}

export const getPublishedBlogs = unstable_cache(
  fetchPublishedBlogs,
  ["published-blogs-v2"],
  { tags: [BLOGS_CACHE_TAG], revalidate: 300 },
);

export const getPublishedBlogSlugRows = unstable_cache(
  fetchPublishedBlogSlugRows,
  ["published-blog-slug-rows-v2"],
  { tags: [BLOGS_CACHE_TAG], revalidate: 300 },
);

export async function getPublishedBlogBySlug(
  slug: string,
): Promise<BlogPublicDetail | null> {
  return unstable_cache(
    async () => fetchPublishedBlogBySlug(slug),
    ["published-blog-by-slug-v2", slug],
    { tags: [BLOGS_CACHE_TAG], revalidate: 300 },
  )();
}

export async function getRelatedPublishedBlogs(
  slug: string,
  limit = 3,
): Promise<BlogPublicListItem[]> {
  return unstable_cache(
    async () => fetchRelatedPublishedBlogs(slug, limit),
    ["related-published-blogs-v2", slug, String(limit)],
    { tags: [BLOGS_CACHE_TAG], revalidate: 300 },
  )();
}

export async function getPublishedBlogSlugs(): Promise<string[]> {
  const rows = await getPublishedBlogSlugRows();
  return rows.map((row) => row.slug);
}
