import { cache } from "react";
import { unstable_cache } from "next/cache";

import { fetchAdminListStats } from "@/data/admin-list-stats";
import {
  adminListRange,
  adminListTotalPages,
  gateEditorPageData,
} from "@/lib/admin/admin-list-query";
import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
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
    const pattern = escapeIlikePattern(query.search);
    request = request.ilike("public_label", `%${pattern}%`);
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
  return fetchAdminListStats(supabase, "cohorts", [
    "total",
    "published",
    "draft",
    "open",
  ]);
}

export async function getCohortsPageData(
  query: CohortListQuery,
): Promise<
  | { status: "forbidden" }
  | { status: "ok"; list: CohortListResult; stats: CohortListStats }
> {
  return gateEditorPageData(
    async (supabase) => {
      const [list, stats] = await Promise.all([
        fetchCohortsPage(supabase, query),
        fetchCohortListStats(supabase),
      ]);
      return { list, stats };
    }
  );
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

      const gated = await gateEditorPageData(
        async (supabase) => {
          const [cohortResult, partnersResult, startupsResult] =
            await Promise.all([
              supabase
                .from("cohorts")
                .select(DETAIL_COLUMNS)
                .eq("id", id)
                .maybeSingle(),
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

          if (cohortResult.error) throw cohortResult.error;
          if (partnersResult.error) throw partnersResult.error;
          if (startupsResult.error) throw startupsResult.error;
          if (!cohortResult.data) return { cohort: null };

          return {
            cohort: {
              ...(cohortResult.data as Cohort),
              partnerIds: (partnersResult.data ?? []).map(
                (row) => row.partner_id,
              ),
              startupIds: (startupsResult.data ?? []).map(
                (row) => row.startup_id,
              ),
            },
          };
        }
      );

      if (gated.status === "forbidden") return gated;
      if (!gated.cohort) return { status: "not_found" };
      return { status: "ok", cohort: gated.cohort };
    },
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
  return gateEditorPageData(
    async (supabase) => {
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
        partners: (partnersResult.data ?? []) as CohortLinkOption[],
        startups: (startupsResult.data ?? []) as CohortLinkOption[],
      };
    }
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
  return gateEditorPageData(
    async (supabase) => {
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

      return { cohorts };
    }
  );
}

/** Cached public list for Phase 6 marketing wiring. */
export const getPublishedCohorts = unstable_cache(
  fetchPublishedCohorts,
  ["published-cohorts"],
  { tags: [COHORTS_CACHE_TAG], revalidate: 300 },
);
