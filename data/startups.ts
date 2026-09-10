import { cache } from "react";
import { unstable_cache } from "next/cache";

import { fetchAdminListStats } from "@/data/admin-list-stats";
import {
  adminListRange,
  adminListTotalPages,
  gateEditorPageData,
} from "@/lib/admin/admin-list-query";
import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { isCurrentUserEditor } from "@/lib/admin/is-current-user-editor";
import { wrapCached, traceAsync } from "@/lib/admin/perf";
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
  startupIdSchema,
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
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("startups")
    .select(LIST_COLUMNS, { count: "estimated" })
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
    totalPages: adminListTotalPages(total, query.pageSize),
  };
}

export type StartupListStats = {
  total: number;
  active: number;
  draft: number;
  inactive: number;
};

async function fetchStartupListStats(
  supabase: ServerClient,
): Promise<StartupListStats> {
  return fetchAdminListStats(supabase, "startups", [
    "total",
    "active",
    "draft",
    "inactive",
  ]);
}

export async function getStartupsPageData(
  query: StartupListQuery,
): Promise<
  | { status: "forbidden" }
  | { status: "ok"; list: StartupListResult; stats: StartupListStats }
> {
  return gateEditorPageData(
    async (supabase) => {
      const [list, stats] = await Promise.all([
        fetchStartupsPage(supabase, query),
        fetchStartupListStats(supabase),
      ]);
      return { list, stats };
    },
    { name: "getStartupsPageData" },
  );
}

/**
 * Deduped per request: `generateMetadata` and the page body both need the same
 * startup.
 */
export const getStartupByIdForAdmin = wrapCached(
  "getStartupByIdForAdmin",
  { eventType: "data_read" },
  cache(
    async (
      id: string,
    ): Promise<
      | { status: "forbidden" }
      | { status: "not_found" }
      | { status: "ok"; startup: StartupWithDetails }
    > => {
      if (!startupIdSchema.safeParse(id).success) return { status: "not_found" };

      const supabase = await createClient();
      if (!(await isCurrentUserEditor())) return { status: "forbidden" };

      const [
        { data: startup, error: startupError },
        { data: details, error: detailsError },
      ] = await Promise.all([
        supabase
          .from("startups")
          .select(DETAIL_COLUMNS)
          .eq("id", id)
          .maybeSingle(),
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
    },
  ),
);

const BLOG_PICKER_LIMIT = 100;

/** Startups for the blog editor related-founder select (not story-exclusive). */
export async function getStartupsForBlogPicker(
  search = "",
  includeStartupId?: string | null,
): Promise<
  | { status: "forbidden" }
  | { status: "ok"; startups: { id: string; name: string }[] }
> {
  return traceAsync(
    "getStartupsForBlogPicker",
    { eventType: "option_load", cacheStatus: "n_a" },
    async () => {
      const supabase = await createClient();
      if (!(await isCurrentUserEditor())) return { status: "forbidden" };

      const term = search.trim().slice(0, 100);
      let request = supabase
        .from("startups")
        .select("id, name")
        .order("name", { ascending: true })
        .limit(BLOG_PICKER_LIMIT);

      if (term) {
        const pattern = escapeIlikePattern(term);
        request = request.ilike("name", `%${pattern}%`);
      }

      const { data, error } = await request;
      if (error) throw error;

      let startups = (data ?? []) as { id: string; name: string }[];

      if (
        includeStartupId &&
        !startups.some((row) => row.id === includeStartupId)
      ) {
        const included = await supabase
          .from("startups")
          .select("id, name")
          .eq("id", includeStartupId)
          .maybeSingle();
        if (included.error) throw included.error;
        if (included.data) {
          startups = [
            included.data as { id: string; name: string },
            ...startups,
          ];
        }
      }

      return { status: "ok", startups };
    },
  );
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
  const { data, error } = await supabase.rpc(
    "get_active_startup_filter_options",
  );

  if (!error) {
    const payload =
      data && typeof data === "object" && !Array.isArray(data)
        ? (data as {
            cohorts?: unknown;
            countries?: unknown;
            sectors?: unknown;
          })
        : {};

    const asStringList = (value: unknown): string[] =>
      Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : [];

    return {
      cohorts: asStringList(payload.cohorts),
      countries: asStringList(payload.countries),
      sectors: asStringList(payload.sectors),
    };
  }

  // Fallback until migration `get_active_startup_filter_options` is applied.
  if (error.code !== "PGRST202") throw error;

  const { data: rows, error: selectError } = await supabase
    .from("startups_public")
    .select("cohort, country_code, sector");
  if (selectError) throw selectError;

  const unique = (key: "cohort" | "country_code" | "sector") =>
    [
      ...new Set(
        (rows ?? [])
          .map((row) => row[key])
          .filter((value): value is string => Boolean(value)),
      ),
    ].sort((a, b) => a.localeCompare(b));

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
