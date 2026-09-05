import { unstable_cache } from "next/cache";

import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type {
  StartupListItem,
  StartupListResult,
  StartupPublicDetail,
  StartupPublicListItem,
  StartupPublicPageResult,
  StartupFilterOptions,
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
  "startup_id, website_url, industry, category, location, founding_year, team, size, problem, solution, target_market, business_model, funding_goal, amount_raised, cohort, country_code, sector, founder_names, cover_image_url, public_outcome, featured, image_focal_x, image_focal_y" as const;

const PUBLIC_LIST_COLUMNS =
  "id, name, slug, logo_url, description, founded_at, cohort, country_code, sector, founder_names, cover_image_url, public_outcome, featured, image_focal_x, image_focal_y" as const;

/**
 * Detail page adds the approved public subset of `startup_details`.
 * Anon SELECT is allowed by RLS only while the parent startup is active.
 */
const PUBLIC_DETAIL_COLUMNS =
  `${PUBLIC_LIST_COLUMNS}, website_url, industry, category, location, team` as const;

const PUBLIC_SLUG_COLUMNS = "slug, updated_at" as const;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Views type every column as nullable. Map to the domain shape the UI expects,
 * dropping any row that is missing required identity fields.
 */
function toPublicListItem(row: {
  id: string | null;
  name: string | null;
  slug: string | null;
  logo_url: string | null;
  description: string | null;
  founded_at: string | null;
  cohort: string | null;
  country_code: string | null;
  sector: string | null;
  founder_names: string[] | null;
  cover_image_url: string | null;
  public_outcome: string | null;
  featured: boolean | null;
  image_focal_x: number | null;
  image_focal_y: number | null;
}): StartupPublicListItem | null {
  if (!row.id || !row.name || !row.slug || row.description == null) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logo_url: row.logo_url,
    description: row.description,
    founded_at: row.founded_at,
    cohort: row.cohort,
    country_code: row.country_code,
    sector: row.sector,
    founder_names: row.founder_names ?? [],
    cover_image_url: row.cover_image_url,
    public_outcome: row.public_outcome,
    featured: row.featured ?? false,
    image_focal_x: row.image_focal_x ?? 50,
    image_focal_y: row.image_focal_y ?? 50,
  };
}

function mapPublicListItems(
  rows: Parameters<typeof toPublicListItem>[0][],
): StartupPublicListItem[] {
  return rows
    .map(toPublicListItem)
    .filter((item): item is StartupPublicListItem => item !== null);
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
    .from("startups_public")
    .select(PUBLIC_LIST_COLUMNS, { count: "exact" });

  if (filters.cohort) request = request.eq("cohort", filters.cohort);
  if (filters.country) request = request.eq("country_code", filters.country);
  if (filters.sector) request = request.eq("sector", filters.sector);

  if (filters.query) {
    const pattern = escapeIlikePattern(filters.query);
    request = request.or(`name.ilike.%${pattern}%,description.ilike.%${pattern}%`);
  }

  const { data, count, error } = await request
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (error) throw error;

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: mapPublicListItems(data ?? []),
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
  filters: ActiveStartupFilters = { cohort: null, country: null, sector: null, query: "" },
): Promise<StartupPublicPageResult> {
  // Page and year have a small, known set of values, so they are safe cache
  // keys. A free-text search is attacker-controlled and would let anyone mint
  // unbounded cache entries, so those queries go straight to Postgres — the
  // gin_trgm index on `name` keeps them cheap.
  if (filters.query) {
    return fetchActiveStartupsPage(page, STARTUP_PUBLIC_PAGE_SIZE, filters);
  }

  return unstable_cache(
    () => fetchActiveStartupsPage(page, STARTUP_PUBLIC_PAGE_SIZE, filters),
    ["active-startups-page", String(page), filters.cohort ?? "all", filters.country ?? "all", filters.sector ?? "all"],
    { tags: [STARTUPS_CACHE_TAG], revalidate: 300 },
  )();
}

async function fetchActiveStartupFilterOptions(): Promise<StartupFilterOptions> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("startups_public")
    .select("cohort, country_code, sector");
  if (error) throw error;

  const unique = (key: "cohort" | "country_code" | "sector") =>
    [...new Set((data ?? []).map((row) => row[key]).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b));

  return {
    cohorts: unique("cohort"),
    countries: unique("country_code"),
    sectors: unique("sector"),
  };
}

export const getActiveStartupFilterOptions = unstable_cache(
  fetchActiveStartupFilterOptions,
  ["active-startup-filter-options"],
  { tags: [STARTUPS_CACHE_TAG], revalidate: 300 },
);

async function fetchActiveStartupFoundedYears(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("startups_public")
    .select("founded_at")
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
    .from("startups_public")
    .select(PUBLIC_DETAIL_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const core = toPublicListItem(data);
  if (!core) return null;

  return {
    ...core,
    details: {
      website_url: data.website_url,
      industry: data.industry,
      category: data.category,
      location: data.location,
      team: data.team,
      cohort: core.cohort,
      country_code: core.country_code,
      sector: core.sector,
      founder_names: core.founder_names,
      cover_image_url: core.cover_image_url,
      public_outcome: core.public_outcome,
      image_focal_x: core.image_focal_x,
      image_focal_y: core.image_focal_y,
    },
  };
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
    .from("startups_public")
    .select(PUBLIC_LIST_COLUMNS)
    .neq("slug", slug)
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return mapPublicListItems(data ?? []);
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
    .from("startups_public")
    .select(PUBLIC_LIST_COLUMNS)
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return mapPublicListItems(data ?? []);
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
    .from("startups_public")
    .select(PUBLIC_SLUG_COLUMNS)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).flatMap((row) => {
    if (!row.slug) return [];
    return [{ slug: row.slug, updated_at: row.updated_at ?? new Date(0).toISOString() }];
  });
}

export const getActiveStartupSlugRows = unstable_cache(
  fetchActiveStartupSlugRows,
  ["active-startup-slugs"],
  { tags: [STARTUPS_CACHE_TAG], revalidate: 300 },
);
