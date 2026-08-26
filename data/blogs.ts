import { unstable_cache } from "next/cache";

import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type {
  Blog,
  BlogListItem,
  BlogListResult,
} from "@/types/blog";
import type { BlogListQuery } from "@/validations/blog";

export const BLOGS_CACHE_TAG = "blogs";

const LIST_COLUMNS =
  "id, slug, title, summary, categories, thumbnail_url, author_name, author_avatar_url, status, is_featured, reading_time_minutes, published_at, created_at, updated_at" as const;

const DETAIL_COLUMNS =
  "id, slug, title, summary, body_html, categories, thumbnail_url, author_name, author_avatar_url, status, is_featured, reading_time_minutes, published_at, created_at, updated_at" as const;

const PUBLIC_COLUMNS =
  "id, slug, title, summary, body_html, categories, thumbnail_url, author_name, author_avatar_url, reading_time_minutes, published_at, is_featured" as const;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchBlogsPage(
  supabase: ServerClient,
  query: BlogListQuery,
): Promise<BlogListResult> {
  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize - 1;

  let request = supabase
    .from("blogs")
    .select(LIST_COLUMNS, { count: "exact" })
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
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getBlogsPageData(
  query: BlogListQuery,
): Promise<
  | { status: "forbidden" }
  | { status: "ok"; list: BlogListResult }
> {
  const supabase = await createClient();
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError) throw adminError;
  if (!isAdmin) return { status: "forbidden" };

  const list = await fetchBlogsPage(supabase, query);
  return { status: "ok", list };
}

export async function getBlogByIdForAdmin(
  id: string,
): Promise<
  | { status: "forbidden" }
  | { status: "not_found" }
  | { status: "ok"; blog: Blog }
> {
  const supabase = await createClient();
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError) throw adminError;
  if (!isAdmin) return { status: "forbidden" };

  const { data, error } = await supabase
    .from("blogs")
    .select(DETAIL_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return { status: "not_found" };
  return { status: "ok", blog: data as Blog };
}

async function fetchPublishedBlogs(): Promise<Blog[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blogs")
    .select(PUBLIC_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Blog[];
}

async function fetchFeaturedBlog(): Promise<Blog | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blogs")
    .select(PUBLIC_COLUMNS)
    .eq("status", "published")
    .eq("is_featured", true)
    .maybeSingle();

  if (error) throw error;
  return (data as Blog | null) ?? null;
}

async function fetchPublishedBlogBySlug(slug: string): Promise<Blog | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blogs")
    .select(PUBLIC_COLUMNS)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return (data as Blog | null) ?? null;
}

export const getPublishedBlogs = unstable_cache(
  fetchPublishedBlogs,
  ["published-blogs"],
  { tags: [BLOGS_CACHE_TAG], revalidate: 300 },
);

export const getFeaturedBlog = unstable_cache(
  fetchFeaturedBlog,
  ["featured-blog"],
  { tags: [BLOGS_CACHE_TAG], revalidate: 300 },
);

export async function getPublishedBlogBySlug(
  slug: string,
): Promise<Blog | null> {
  return unstable_cache(
    async () => fetchPublishedBlogBySlug(slug),
    ["published-blog-by-slug", slug],
    { tags: [BLOGS_CACHE_TAG], revalidate: 300 },
  )();
}

export async function getRelatedPublishedBlogs(
  slug: string,
  limit = 3,
): Promise<Blog[]> {
  const current = await getPublishedBlogBySlug(slug);
  const all = await getPublishedBlogs();
  if (!current) return all.filter((b) => b.slug !== slug).slice(0, limit);

  const primary = current.categories[0];
  const sameCategory = all.filter(
    (blog) =>
      blog.slug !== slug && primary && blog.categories.includes(primary),
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const extras = all.filter(
    (blog) =>
      blog.slug !== slug && !sameCategory.some((row) => row.id === blog.id),
  );
  return [...sameCategory, ...extras].slice(0, limit);
}

export async function getPublishedBlogSlugs(): Promise<string[]> {
  const blogs = await getPublishedBlogs();
  return blogs.map((blog) => blog.slug);
}
