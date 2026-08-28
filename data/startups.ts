import { unstable_cache } from "next/cache";

import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type {
  StartupListItem,
  StartupListResult,
  StartupPublicDetail,
  StartupPublicListItem,
  StartupPublicPageResult,
  StartupSlugRow,
  StartupWithDetails,
} from "@/types/startup";
import {
  STARTUP_PUBLIC_PAGE_SIZE,
  type ActiveStartupFilters,
  type StartupListQuery,
} from "@/validations/startup";

export const STARTUPS_CACHE_TAG = "startups";

const LIST_COLUMNS =
  "id, name, slug, logo_url, description, status, founded_at, created_at, updated_at" as const;

const DETAIL_COLUMNS =
  "id, name, slug, logo_url, description, status, founded_at, created_at, updated_at" as const;

const DETAILS_COLUMNS =
  "startup_id, website_url, industry, category, location, founding_year, team, size, problem, solution, target_market, business_model, funding_goal, amount_raised" as const;

const PUBLIC_LIST_COLUMNS =
  "id, name, slug, logo_url, description, founded_at" as const;

/**
 * Detail page adds the approved public subset of `startup_details`.
 * Anon SELECT is allowed by RLS only while the parent startup is active.
 */
const PUBLIC_DETAIL_COLUMNS =
  `${PUBLIC_LIST_COLUMNS}, startup_details(industry, category, location, team)` as const;

const PUBLIC_SLUG_COLUMNS = "slug, updated_at" as const;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

/** Escape PostgREST ilike wildcards in user search input. */
function escapeIlikePattern(value: string): string {
  return value.replace(/[%_]/g, "\\$&");
}

async function fetchStartupsPage(
  supabase: ServerClient,
  query: StartupListQuery,
): Promise<StartupListResult> {
  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize - 1;

  let request = supabase
    .from("startups")
    .select(LIST_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (query.status !== "all") {
    request = request.eq("status", query.status);
  }

  if (query.search) {
    const pattern = escapeIlikePattern(query.search);
    request = request.or(`name.ilike.%${pattern}%,slug.ilike.%${pattern}%`);
  }

  const { data, count, error } = await request;
  if (error) throw error;

  const total = count ?? 0;
  return {
    startups: (data ?? []) as StartupListItem[],
    total,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getStartupsPageData(
  query: StartupListQuery,
): Promise<
  { status: "forbidden" } | { status: "ok"; list: StartupListResult }
> {
  const supabase = await createClient();
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError) throw adminError;
  if (!isAdmin) return { status: "forbidden" };

  const list = await fetchStartupsPage(supabase, query);
  return { status: "ok", list };
}

export async function getStartupByIdForAdmin(
  id: string,
): Promise<
  | { status: "forbidden" }
  | { status: "not_found" }
  | { status: "ok"; startup: StartupWithDetails }
> {
  const supabase = await createClient();
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError) throw adminError;
  if (!isAdmin) return { status: "forbidden" };

  const [
    { data: startup, error: startupError },
    { data: details, error: detailsError },
  ] = await Promise.all([
    supabase.from("startups").select(DETAIL_COLUMNS).eq("id", id).maybeSingle(),
    supabase
      .from("startup_details")
      .select(DETAILS_COLUMNS)
      .eq("startup_id", id)
      .maybeSingle(),
  ]);

  if (startupError) throw startupError;
  if (detailsError) throw detailsError;
  if (!startup) return { status: "not_found" };

  return {
    status: "ok",
    startup: {
      ...(startup as StartupListItem & {
        status: StartupWithDetails["status"];
      }),
      details: details ?? null,
    } as StartupWithDetails,
  };
}

async function fetchActiveStartupsPage(
  page: number,
  pageSize: number,
  filters: ActiveStartupFilters,
): Promise<StartupPublicPageResult> {
  const supabase = createPublicClient();
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  let request = supabase
    .from("startups")
    .select(PUBLIC_LIST_COLUMNS, { count: "exact" })
    .eq("status", "active");

  if (filters.year) {
    // founded_at is a date; a half-open range keeps the column index usable.
    request = request
      .gte("founded_at", `${filters.year}-01-01`)
      .lt("founded_at", `${Number(filters.year) + 1}-01-01`);
  }

  if (filters.search) {
    request = request.ilike("name", `%${escapeIlikePattern(filters.search)}%`);
  }

  const { data, count, error } = await request
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (error) throw error;

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: (data ?? []) as StartupPublicListItem[],
    total,
    totalPages,
    currentPage: safePage,
    pageSize,
  };
}

/**
 * One page of the public founders list, filtered in Postgres. Year and search
 * come from the URL, so each combination is cached independently instead of
 * shipping every active startup to the browser.
 */
export async function getActiveStartupsPage(
  page: number,
  filters: ActiveStartupFilters = { year: null, search: "" },
): Promise<StartupPublicPageResult> {
  // Page and year have a small, known set of values, so they are safe cache
  // keys. A free-text search is attacker-controlled and would let anyone mint
  // unbounded cache entries, so those queries go straight to Postgres — the
  // gin_trgm index on `name` keeps them cheap.
  if (filters.search) {
    return fetchActiveStartupsPage(page, STARTUP_PUBLIC_PAGE_SIZE, filters);
  }

  return unstable_cache(
    () => fetchActiveStartupsPage(page, STARTUP_PUBLIC_PAGE_SIZE, filters),
    ["active-startups-page", String(page), filters.year ?? "all"],
    { tags: [STARTUPS_CACHE_TAG], revalidate: 300 },
  )();
}

async function fetchActiveStartupFoundedYears(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("startups")
    .select("founded_at")
    .eq("status", "active")
    .not("founded_at", "is", null);

  if (error) throw error;

  const years = new Set<string>();
  for (const row of data ?? []) {
    const foundedAt =
      row && typeof row === "object" && "founded_at" in row
        ? (row.founded_at as string | null)
        : null;
    if (!foundedAt) continue;
    const match = /^(\d{4})/.exec(foundedAt);
    if (match?.[1]) years.add(match[1]);
  }

  return [...years].sort((a, b) => Number(b) - Number(a));
}

export const getActiveStartupFoundedYears = unstable_cache(
  fetchActiveStartupFoundedYears,
  ["active-startup-founded-years"],
  { tags: [STARTUPS_CACHE_TAG], revalidate: 300 },
);

async function fetchActiveStartupBySlug(
  slug: string,
): Promise<StartupPublicDetail | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("startups")
    .select(PUBLIC_DETAIL_COLUMNS)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // PostgREST returns the 1:1 embed as an object (or null when absent).
  const { startup_details: details, ...core } = data;

  return {
    ...core,
    details: (Array.isArray(details) ? (details[0] ?? null) : details) ?? null,
  } as StartupPublicDetail;
}

export function getActiveStartupBySlug(slug: string) {
  return unstable_cache(
    () => fetchActiveStartupBySlug(slug),
    ["active-startup-by-slug", slug],
    { tags: [STARTUPS_CACHE_TAG], revalidate: 300 },
  )();
}

async function fetchRelatedActiveStartups(
  slug: string,
  limit: number,
): Promise<StartupPublicListItem[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("startups")
    .select(PUBLIC_LIST_COLUMNS)
    .eq("status", "active")
    .neq("slug", slug)
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as StartupPublicListItem[];
}

export async function getRelatedActiveStartups(
  slug: string,
  limit = 3,
): Promise<StartupPublicListItem[]> {
  return unstable_cache(
    () => fetchRelatedActiveStartups(slug, limit),
    ["related-active-startups", slug, String(limit)],
    { tags: [STARTUPS_CACHE_TAG], revalidate: 300 },
  )();
}

async function fetchSpotlightStartups(
  limit: number,
): Promise<StartupPublicListItem[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("startups")
    .select(PUBLIC_LIST_COLUMNS)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as StartupPublicListItem[];
}

/** Newest active ventures for the home spotlight and outcome modules. */
export async function getSpotlightStartups(
  limit = 5,
): Promise<StartupPublicListItem[]> {
  return unstable_cache(
    () => fetchSpotlightStartups(limit),
    ["spotlight-startups", String(limit)],
    { tags: [STARTUPS_CACHE_TAG], revalidate: 300 },
  )();
}

async function fetchActiveStartupSlugRows(): Promise<StartupSlugRow[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("startups")
    .select(PUBLIC_SLUG_COLUMNS)
    .eq("status", "active")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as StartupSlugRow[];
}

export const getActiveStartupSlugRows = unstable_cache(
  fetchActiveStartupSlugRows,
  ["active-startup-slugs"],
  { tags: [STARTUPS_CACHE_TAG], revalidate: 300 },
);
