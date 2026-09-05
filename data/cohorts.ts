import { cache } from "react";
import { unstable_cache } from "next/cache";

import {
  adminListRange,
  adminListTotalPages,
} from "@/lib/admin/admin-list-query";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type {
  Cohort,
  CohortAdminDetail,
  CohortLinkOption,
  CohortListItem,
  CohortListResult,
  CohortPublicListItem,
} from "@/types/cohort";
import { cohortIdSchema, type CohortListQuery } from "@/validations/cohort";

export const COHORTS_CACHE_TAG = "cohorts";

/** Cap multi-select option lists so editor pages stay bounded. */
const LINK_OPTIONS_LIMIT = 500;

/** Cap junction id loads on detail so a bad dataset cannot unbounded-read. */
const DETAIL_LINK_LIMIT = 500;

/** Cap public published list so anon reads stay bounded. */
const PUBLIC_LIMIT = 500;

const LIST_COLUMNS =
  "id, year, public_label, programme_dates_start, programme_dates_end, programme_status, publish_status, created_at, updated_at" as const;

const DETAIL_COLUMNS =
  "id, year, public_label, programme_dates_start, programme_dates_end, programme_status, summary, media_url, publish_status, created_at, updated_at" as const;

const PUBLIC_LIST_COLUMNS =
  "id, year, public_label, programme_dates_start, programme_dates_end, programme_status, summary, media_url, updated_at" as const;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchCohortsPage(
  supabase: ServerClient,
  query: CohortListQuery,
): Promise<CohortListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("cohorts")
    .select(LIST_COLUMNS, { count: "exact" })
    .order("year", { ascending: false })
    .order("public_label", { ascending: true })
    .range(from, to);

  if (query.status !== "all") {
    request = request.eq("publish_status", query.status);
  }

  if (query.search) {
    request = request.ilike("public_label", `%${query.search}%`);
  }

  const { data, count, error } = await request;
  if (error) throw error;

  const total = count ?? 0;
  return {
    cohorts: (data ?? []) as CohortListItem[],
    total,
    totalPages: adminListTotalPages(total, query.pageSize),
  };
}

export async function getCohortsPageData(
  query: CohortListQuery,
): Promise<{ status: "forbidden" } | { status: "ok"; list: CohortListResult }> {
  const supabase = await createClient();

  const [adminResult, list] = await Promise.all([
    supabase.rpc("is_admin"),
    fetchCohortsPage(supabase, query),
  ]);

  if (adminResult.error) throw adminResult.error;
  if (!adminResult.data) return { status: "forbidden" };

  return { status: "ok", list };
}

export const getCohortByIdForAdmin = cache(
  async (
    id: string,
  ): Promise<
    | { status: "forbidden" }
    | { status: "not_found" }
    | { status: "ok"; cohort: CohortAdminDetail }
  > => {
    if (!cohortIdSchema.safeParse(id).success) return { status: "not_found" };

    const supabase = await createClient();
    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
    if (adminError) throw adminError;
    if (!isAdmin) return { status: "forbidden" };

    const { data, error } = await supabase
      .from("cohorts")
      .select(DETAIL_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { status: "not_found" };

    const [partnersResult, startupsResult] = await Promise.all([
      supabase
        .from("cohort_partners")
        .select("partner_id")
        .eq("cohort_id", id)
        .limit(DETAIL_LINK_LIMIT),
      supabase
        .from("cohort_startups")
        .select("startup_id")
        .eq("cohort_id", id)
        .limit(DETAIL_LINK_LIMIT),
    ]);

    if (partnersResult.error) throw partnersResult.error;
    if (startupsResult.error) throw startupsResult.error;

    return {
      status: "ok",
      cohort: {
        ...(data as Cohort),
        partnerIds: (partnersResult.data ?? []).map((row) => row.partner_id),
        startupIds: (startupsResult.data ?? []).map((row) => row.startup_id),
      },
    };
  },
);

/** Narrow id/name lists for the cohort editor multi-selects. */
export async function getCohortLinkOptionsForAdmin(): Promise<
  | { status: "forbidden" }
  | {
      status: "ok";
      partners: CohortLinkOption[];
      startups: CohortLinkOption[];
    }
> {
  const supabase = await createClient();
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError) throw adminError;
  if (!isAdmin) return { status: "forbidden" };

  const [partnersResult, startupsResult] = await Promise.all([
    supabase
      .from("partners")
      .select("id, name")
      .order("name", { ascending: true })
      .limit(LINK_OPTIONS_LIMIT),
    supabase
      .from("startups")
      .select("id, name")
      .order("name", { ascending: true })
      .limit(LINK_OPTIONS_LIMIT),
  ]);

  if (partnersResult.error) throw partnersResult.error;
  if (startupsResult.error) throw startupsResult.error;

  return {
    status: "ok",
    partners: (partnersResult.data ?? []) as CohortLinkOption[],
    startups: (startupsResult.data ?? []) as CohortLinkOption[],
  };
}

async function fetchPublishedCohorts(): Promise<CohortPublicListItem[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("cohorts")
    .select(PUBLIC_LIST_COLUMNS)
    .eq("publish_status", "published")
    .order("year", { ascending: false })
    .order("public_label", { ascending: true })
    .limit(PUBLIC_LIMIT);

  if (error) throw error;
  return (data ?? []) as CohortPublicListItem[];
}

/** Cached public list for Phase 6 marketing wiring. */
export const getPublishedCohorts = unstable_cache(
  fetchPublishedCohorts,
  ["published-cohorts"],
  { tags: [COHORTS_CACHE_TAG], revalidate: 300 },
);
