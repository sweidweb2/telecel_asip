import { cache } from "react";
import { unstable_cache } from "next/cache";

import {
  adminListRange,
  adminListTotalPages,
} from "@/lib/admin/admin-list-query";
import { countExact } from "@/lib/admin/count-exact";
import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { isCurrentUserEditor } from "@/lib/admin/is-current-user-editor";
import { wrapCached, traceAsync } from "@/lib/admin/perf";
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
const LINK_OPTIONS_LIMIT = 100;

/** Cap junction id loads on detail so a bad dataset cannot unbounded-read. */
const DETAIL_LINK_LIMIT = 200;

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
    .select(LIST_COLUMNS, { count: "estimated" })
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

export type CohortListStats = {
  total: number;
  published: number;
  draft: number;
  open: number;
};

async function fetchCohortListStats(
  supabase: ServerClient,
): Promise<CohortListStats> {
  const [total, published, draft, open] = await Promise.all([
    supabase.from("cohorts").select("id", { count: "exact", head: true }),
    supabase
      .from("cohorts")
      .select("id", { count: "exact", head: true })
      .eq("publish_status", "published"),
    supabase
      .from("cohorts")
      .select("id", { count: "exact", head: true })
      .eq("publish_status", "draft"),
    supabase
      .from("cohorts")
      .select("id", { count: "exact", head: true })
      .eq("programme_status", "open"),
  ]);

  return {
    total: countExact(total),
    published: countExact(published),
    draft: countExact(draft),
    open: countExact(open),
  };
}

export async function getCohortsPageData(
  query: CohortListQuery,
): Promise<
  | { status: "forbidden" }
  | { status: "ok"; list: CohortListResult; stats: CohortListStats }
> {
  return traceAsync(
    "getCohortsPageData",
    { eventType: "data_read", cacheStatus: "n_a" },
    async () => {
      const supabase = await createClient();

      const [isAdmin, list, stats] = await Promise.all([
        isCurrentUserEditor(),
        fetchCohortsPage(supabase, query),
        fetchCohortListStats(supabase),
      ]);

      if (!isAdmin) return { status: "forbidden" };

      return { status: "ok", list, stats };
    },
  );
}

export const getCohortByIdForAdmin = wrapCached(
  "getCohortByIdForAdmin",
  { eventType: "data_read" },
  cache(
    async (
      id: string,
    ): Promise<
      | { status: "forbidden" }
      | { status: "not_found" }
      | { status: "ok"; cohort: CohortAdminDetail }
    > => {
      if (!cohortIdSchema.safeParse(id).success) return { status: "not_found" };

      const supabase = await createClient();
      if (!(await isCurrentUserEditor())) return { status: "forbidden" };

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
  ),
);

/** Narrow id/name lists for the cohort editor multi-selects. */
export async function getCohortLinkOptionsForAdmin(
  search = "",
): Promise<
  | { status: "forbidden" }
  | {
      status: "ok";
      partners: CohortLinkOption[];
      startups: CohortLinkOption[];
    }
> {
  return traceAsync(
    "getCohortLinkOptionsForAdmin",
    { eventType: "option_load", cacheStatus: "n_a" },
    async () => {
      const supabase = await createClient();
      if (!(await isCurrentUserEditor())) return { status: "forbidden" };

      const term = search.trim().slice(0, 100);
      const pattern = term ? escapeIlikePattern(term) : "";

      let partnersQuery = supabase
        .from("partners")
        .select("id, name")
        .order("name", { ascending: true })
        .limit(LINK_OPTIONS_LIMIT);
      let startupsQuery = supabase
        .from("startups")
        .select("id, name")
        .order("name", { ascending: true })
        .limit(LINK_OPTIONS_LIMIT);

      if (pattern) {
        partnersQuery = partnersQuery.ilike("name", `%${pattern}%`);
        startupsQuery = startupsQuery.ilike("name", `%${pattern}%`);
      }

      const [partnersResult, startupsResult] = await Promise.all([
        partnersQuery,
        startupsQuery,
      ]);

      if (partnersResult.error) throw partnersResult.error;
      if (startupsResult.error) throw startupsResult.error;

      return {
        status: "ok",
        partners: (partnersResult.data ?? []) as CohortLinkOption[],
        startups: (startupsResult.data ?? []) as CohortLinkOption[],
      };
    },
  );
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

/** Narrow id/label list for the blog editor related-cohort select. */
export async function getCohortsForBlogPicker(
  search = "",
  includeCohortId?: string | null,
): Promise<
  | { status: "forbidden" }
  | { status: "ok"; cohorts: { id: string; label: string }[] }
> {
  return traceAsync(
    "getCohortsForBlogPicker",
    { eventType: "option_load", cacheStatus: "n_a" },
    async () => {
      const supabase = await createClient();
      if (!(await isCurrentUserEditor())) return { status: "forbidden" };

      const term = search.trim().slice(0, 100);
      let request = supabase
        .from("cohorts")
        .select("id, public_label")
        .order("year", { ascending: false })
        .order("public_label", { ascending: true })
        .limit(LINK_OPTIONS_LIMIT);

      if (term) {
        const pattern = escapeIlikePattern(term);
        request = request.ilike("public_label", `%${pattern}%`);
      }

      const { data, error } = await request;
      if (error) throw error;

      let cohorts = (data ?? []).map((row) => ({
        id: row.id,
        label: row.public_label,
      }));

      if (includeCohortId && !cohorts.some((row) => row.id === includeCohortId)) {
        const included = await supabase
          .from("cohorts")
          .select("id, public_label")
          .eq("id", includeCohortId)
          .maybeSingle();
        if (included.error) throw included.error;
        if (included.data) {
          cohorts = [
            { id: included.data.id, label: included.data.public_label },
            ...cohorts,
          ];
        }
      }

      return { status: "ok", cohorts };
    },
  );
}

/** Cached public list for Phase 6 marketing wiring. */
export const getPublishedCohorts = unstable_cache(
  fetchPublishedCohorts,
  ["published-cohorts"],
  { tags: [COHORTS_CACHE_TAG], revalidate: 300 },
);
