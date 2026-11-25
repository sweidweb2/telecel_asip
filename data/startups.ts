import { cache } from "react";
import { unstable_cache } from "next/cache";

import { fetchAdminListStats } from "@/data/admin-list-stats";
import {
  adminListRange,
  adminListTotalPages,
  gateEditorPageData,
} from "@/lib/admin/admin-list-query";
import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { publicStartupDescription } from "@/lib/marketing/public-startup-description";
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
    description: publicStartupDescription(row.description),
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
    }
  );
}

/**
 * Deduped per request: `generateMetadata` and the page body both need the same
 * startup.
 */
export const getStartupByIdForAdmin = cache(
    async (
      id: string,
    ): Promise<
      | { status: "forbidden" }
      | { status: "not_found" }
      | { status: "ok"; startup: StartupWithDetails }
    > => {
      if (!startupIdSchema.safeParse(id).success) return { status: "not_found" };

      const gated = await gateEditorPageData(
        async (supabase) => {
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
          if (!startup) return { startup: null };

          return {
            startup: {
              ...(startup as StartupListItem & {
                status: StartupWithDetails["status"];
              }),
              details: details ?? null,
            } as StartupWithDetails,
          };
        }
      );

      if (gated.status === "forbidden") return gated;
      if (!gated.startup) return { status: "not_found" };
      return { status: "ok", startup: gated.startup };
    },
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
  return gateEditorPageData(
    async (supabase) => {
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

      return { startups };
    }
  );
}

/** Mulberry32 — tiny seeded PRNG so the same `?s=` yields a stable shuffle. */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleSeeded<T>(items: readonly T[], seed: number): T[] {
  const next = mulberry32(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

/**
 * Matching active startup ids only — narrow enough to shuffle the full
 * portfolio in-process without pulling list/card payloads on every page.
 * Filters may reference `name` / `description` without selecting those columns.
 */
async function fetchActiveStartupIdsMatching(
  filters: ActiveStartupFilters,
): Promise<string[]> {
  const supabase = createPublicClient();

  let request = supabase.from("startups_public").select("id");
  if (filters.cohort) request = request.eq("cohort", filters.cohort);
  if (filters.country) request = request.eq("country_code", filters.country);
  if (filters.sector) request = request.eq("sector", filters.sector);
  if (filters.query) {
    const pattern = escapeIlikePattern(filters.query);
    request = request.or(
      `name.ilike.%${pattern}%,description.ilike.%${pattern}%`,
    );
  }

  // Stable base order — randomisation happens in-process via the shuffle seed.
  const { data, error } = await request.order("id", { ascending: true });

  if (error) throw error;

  return (data ?? []).flatMap((row) => (row.id ? [row.id] : []));
}

/** Wide list columns for a single page of ids, re-ordered to match `ids`. */
async function fetchPublicListItemsByIds(
  ids: readonly string[],
): Promise<StartupPublicListItem[]> {
  if (ids.length === 0) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("startups_public")
    .select(PUBLIC_LIST_COLUMNS)
    .in("id", ids);

  if (error) throw error;

  const byId = new Map(
    mapPublicListItems(data ?? []).map((item) => [item.id, item]),
  );

  return ids.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
}

/**
 * One page of the public founders list. Matching ids are cached; the shuffle
 * seed (`?s=`) randomises order per visit without duplicating rows across pages.
 * Full list columns load only for the current page slice.
 */
export async function getActiveStartupsPage(
  page: number,
  filters: ActiveStartupFilters = {
    cohort: null,
    country: null,
    sector: null,
    query: "",
  },
  shuffleSeed = 0,
): Promise<StartupPublicPageResult> {
  // Free-text search is attacker-controlled and would mint unbounded cache
  // entries, so those id queries go straight to Postgres. Filter-only id lists
  // are small and safe to cache; shuffle happens after the cache hit.
  const allIds = filters.query
    ? await fetchActiveStartupIdsMatching(filters)
    : await unstable_cache(
        () => fetchActiveStartupIdsMatching(filters),
        [
          "active-startup-ids",
          filters.cohort ?? "all",
          filters.country ?? "all",
          filters.sector ?? "all",
        ],
        { tags: [STARTUPS_CACHE_TAG], revalidate: 300 },
      )();

  const pageSize = STARTUP_PUBLIC_PAGE_SIZE;
  const shuffledIds = shuffleSeeded(allIds, shuffleSeed);
  const total = shuffledIds.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = (safePage - 1) * pageSize;
  const pageIds = shuffledIds.slice(from, from + pageSize);
  const items = await fetchPublicListItemsByIds(pageIds);

  return {
    items,
    total,
    totalPages,
    currentPage: safePage,
    pageSize,
  };
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
