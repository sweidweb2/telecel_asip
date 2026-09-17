import { cache } from "react";

import { fetchAdminListStats } from "@/data/admin-list-stats";
import {
  adminListRange,
  adminListTotalPages,
} from "@/lib/admin/admin-list-query";
import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { isCurrentUserEditor } from "@/lib/admin/is-current-user-editor";
import { wrapCached, traceAsync } from "@/lib/admin/perf";
import { createClient } from "@/lib/supabase/server";
import type {
  EvidenceDetail,
  EvidenceListItem,
  EvidenceListResult,
  EvidenceOwnerOption,
  EvidenceRecord,
} from "@/types/evidence-record";
import {
  evidenceRecordIdSchema,
  type EvidenceListQuery,
} from "@/validations/evidence-record";

const LIST_COLUMNS =
  "id, primary_source, measurement_period_start, measurement_period_end, owner_id, status, permission, owner:profiles!evidence_records_owner_id_fkey(email, full_name)" as const;

const DETAIL_COLUMNS =
  "id, primary_source, source_file_url, measurement_period_start, measurement_period_end, owner_id, status, last_verified_date, permission, review_date, created_at, updated_at, owner:profiles!evidence_records_owner_id_fkey(id, email, full_name)" as const;

const OWNER_OPTION_LIMIT = 100;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

function normalizeListOwner(
  owner:
    | Pick<EvidenceOwnerOption, "email" | "full_name">
    | Array<Pick<EvidenceOwnerOption, "email" | "full_name">>
    | null,
): Pick<EvidenceOwnerOption, "email" | "full_name"> | null {
  if (!owner) return null;
  const row = Array.isArray(owner) ? (owner[0] ?? null) : owner;
  if (!row) return null;
  return { email: row.email, full_name: row.full_name };
}

function normalizeDetailOwner(
  owner: EvidenceOwnerOption | EvidenceOwnerOption[] | null,
): EvidenceOwnerOption | null {
  if (!owner) return null;
  return Array.isArray(owner) ? (owner[0] ?? null) : owner;
}

async function fetchEvidencePage(
  supabase: ServerClient,
  query: EvidenceListQuery,
): Promise<EvidenceListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("evidence_records")
    .select(LIST_COLUMNS, { count: "estimated" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (query.status !== "all") {
    request = request.eq("status", query.status);
  }

  if (query.permission !== "all") {
    request = request.eq("permission", query.permission);
  }

  if (query.search) {
    const pattern = escapeIlikePattern(query.search);
    request = request.ilike("primary_source", `%${pattern}%`);
  }

  const { data, count, error } = await request;
  if (error) throw error;

  const records = (data ?? []).map((row) => ({
    ...row,
    owner: normalizeListOwner(
      row.owner as
        | Pick<EvidenceOwnerOption, "email" | "full_name">
        | Array<Pick<EvidenceOwnerOption, "email" | "full_name">>
        | null,
    ),
  })) as EvidenceListItem[];

  const total = count ?? 0;
  return {
    records,
    total,
    totalPages: adminListTotalPages(total, query.pageSize),
  };
}

export type EvidenceListStats = {
  total: number;
  verified: number;
  pending: number;
  attention: number;
};

async function fetchEvidenceListStats(
  supabase: ServerClient,
): Promise<EvidenceListStats> {
  return fetchAdminListStats(supabase, "evidence_records", [
    "total",
    "verified",
    "pending",
    "attention",
  ]);
}

export async function getEvidenceRecordsPageData(
  query: EvidenceListQuery,
): Promise<
  | { status: "forbidden" }
  | { status: "ok"; list: EvidenceListResult; stats: EvidenceListStats }
> {
  return traceAsync(
    "getEvidenceRecordsPageData",
    { eventType: "data_read", cacheStatus: "n_a" },
    async () => {
      const supabase = await createClient();

      const [isAdmin, list, stats] = await Promise.all([
        isCurrentUserEditor(),
        fetchEvidencePage(supabase, query),
        fetchEvidenceListStats(supabase),
      ]);

      if (!isAdmin) return { status: "forbidden" };

      return { status: "ok", list, stats };
    },
  );
}

type EvidenceDetailResult =
  | { status: "forbidden" }
  | { status: "not_found" }
  | { status: "ok"; record: EvidenceDetail };

export const getEvidenceRecordByIdForAdmin = wrapCached(
  "getEvidenceRecordByIdForAdmin",
  { eventType: "data_read" },
  cache(
    async (id: string): Promise<EvidenceDetailResult> => {
      if (!evidenceRecordIdSchema.safeParse(id).success) {
        return { status: "not_found" };
      }

      const supabase = await createClient();
      if (!(await isCurrentUserEditor())) return { status: "forbidden" };

      const { data, error } = await supabase
        .from("evidence_records")
        .select(DETAIL_COLUMNS)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { status: "not_found" };

      return {
        status: "ok",
        record: {
          ...(data as EvidenceRecord & {
            owner: EvidenceOwnerOption | EvidenceOwnerOption[] | null;
          }),
          owner: normalizeDetailOwner(
            data.owner as EvidenceOwnerOption | EvidenceOwnerOption[] | null,
          ),
        },
      };
    },
  ),
);

/**
 * Profiles available as evidence owners in the admin form.
 * Admin-gated; capped so the Select stays practical.
 */
export async function getEvidenceOwnerOptions(
  search = "",
  includeOwnerId?: string | null,
): Promise<
  { status: "forbidden" } | { status: "ok"; owners: EvidenceOwnerOption[] }
> {
  return traceAsync(
    "getEvidenceOwnerOptions",
    { eventType: "option_load", cacheStatus: "n_a" },
    async () => {
      const supabase = await createClient();
      if (!(await isCurrentUserEditor())) return { status: "forbidden" };

      const term = search.trim().slice(0, 100);
      let request = supabase
        .from("profiles")
        .select("id, email, full_name")
        .order("full_name", { ascending: true, nullsFirst: false })
        .order("email", { ascending: true })
        .limit(OWNER_OPTION_LIMIT);

      if (term) {
        const pattern = escapeIlikePattern(term);
        request = request.or(
          `full_name.ilike.%${pattern}%,email.ilike.%${pattern}%`,
        );
      }

      const { data, error } = await request;
      if (error) throw error;

      let owners = (data ?? []) as EvidenceOwnerOption[];
      if (includeOwnerId && !owners.some((row) => row.id === includeOwnerId)) {
        const included = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .eq("id", includeOwnerId)
          .maybeSingle();
        if (included.error) throw included.error;
        if (included.data) {
          owners = [included.data as EvidenceOwnerOption, ...owners];
        }
      }

      return { status: "ok", owners };
    },
  );
}
