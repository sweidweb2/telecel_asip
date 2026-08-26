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

const PUBLIC_SLUG_COLUMNS = "slug, updated_at" as const;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

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
    request = request.or(
      `name.ilike.%${query.search}%,slug.ilike.%${query.search}%`,
    );
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
  | { status: "forbidden" }
  | { status: "ok"; list: StartupListResult }
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

  const [{ data: startup, error: startupError }, { data: details, error: detailsError }] =
    await Promise.all([
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
): Promise<StartupPublicPageResult> {
  const supabase = createPublicClient();
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from("startups")
    .select(PUBLIC_LIST_COLUMNS, { count: "exact" })
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (error) throw error;

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(safePage, totalPages);

  return {
    items: (data ?? []) as StartupPublicListItem[],
    total,
    totalPages,
    currentPage,
    pageSize,
  };
}

export async function getActiveStartupsPage(
  page: number,
): Promise<StartupPublicPageResult> {
  return unstable_cache(
    async () => {
      const first = await fetchActiveStartupsPage(
        page,
        STARTUP_PUBLIC_PAGE_SIZE,
      );
      if (page > first.totalPages && first.totalPages >= 1) {
        return fetchActiveStartupsPage(
          first.totalPages,
          STARTUP_PUBLIC_PAGE_SIZE,
        );
      }
      return first;
    },
    ["active-startups-page", String(page)],
    { tags: [STARTUPS_CACHE_TAG], revalidate: 300 },
  )();
}

async function fetchActiveStartupBySlug(
  slug: string,
): Promise<StartupPublicDetail | null> {
  const supabase = createPublicClient();
  const { data: startup, error } = await supabase
    .from("startups")
    .select(PUBLIC_LIST_COLUMNS)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  if (!startup) return null;

  const { data: details, error: detailsError } = await supabase
    .from("startup_details")
    .select(DETAILS_COLUMNS)
    .eq("startup_id", startup.id)
    .maybeSingle();

  if (detailsError) throw detailsError;

  return {
    ...(startup as StartupPublicListItem),
    details: details
      ? {
          website_url: details.website_url,
          industry: details.industry,
          category: details.category,
          location: details.location,
          founding_year: details.founding_year,
          team: details.team,
          size: details.size,
          problem: details.problem,
          solution: details.solution,
          target_market: details.target_market,
          business_model: details.business_model,
          funding_goal: details.funding_goal,
          amount_raised: details.amount_raised,
        }
      : null,
  };
}

export function getActiveStartupBySlug(slug: string) {
  return unstable_cache(
    () => fetchActiveStartupBySlug(slug),
    ["active-startup-by-slug", slug],
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
