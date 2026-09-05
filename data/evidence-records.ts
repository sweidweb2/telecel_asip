import { cache } from "react";

import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { createClient } from "@/lib/supabase/server";
import type {
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
  "id, primary_source, source_file_url, measurement_period_start, measurement_period_end, owner_id, status, last_verified_date, permission, review_date, created_at, updated_at, owner:profiles!evidence_records_owner_id_fkey(id, email, full_name)" as const;

const OWNER_OPTION_LIMIT = 200;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

function normalizeOwner(
  owner: EvidenceOwnerOption | EvidenceOwnerOption[] | null,
): EvidenceOwnerOption | null {
  if (!owner) return null;
  return Array.isArray(owner) ? (owner[0] ?? null) : owner;
}

async function fetchEvidencePage(
  supabase: ServerClient,
  query: EvidenceListQuery,
): Promise<EvidenceListResult> {
  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize - 1;

  let request = supabase
    .from("evidence_records")
    .select(LIST_COLUMNS, { count: "exact" })
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
    owner: normalizeOwner(
      row.owner as EvidenceOwnerOption | EvidenceOwnerOption[] | null,
    ),
  })) as EvidenceListItem[];

  const total = count ?? 0;
  return {
    records,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getEvidenceRecordsPageData(
  query: EvidenceListQuery,
): Promise<
  { status: "forbidden" } | { status: "ok"; list: EvidenceListResult }
> {
  const supabase = await createClient();

  const [adminResult, list] = await Promise.all([
    supabase.rpc("is_admin"),
    fetchEvidencePage(supabase, query),
  ]);

  if (adminResult.error) throw adminResult.error;
  if (!adminResult.data) return { status: "forbidden" };

  return { status: "ok", list };
}

type EvidenceDetailResult =
  | { status: "forbidden" }
  | { status: "not_found" }
  | { status: "ok"; record: EvidenceListItem };

export const getEvidenceRecordByIdForAdmin = cache(
  async (id: string): Promise<EvidenceDetailResult> => {
    if (!evidenceRecordIdSchema.safeParse(id).success) {
      return { status: "not_found" };
    }

    const supabase = await createClient();
    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
    if (adminError) throw adminError;
    if (!isAdmin) return { status: "forbidden" };

    const { data, error } = await supabase
      .from("evidence_records")
      .select(LIST_COLUMNS)
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
        owner: normalizeOwner(
          data.owner as EvidenceOwnerOption | EvidenceOwnerOption[] | null,
        ),
      },
    };
  },
);

/**
 * Profiles available as evidence owners in the admin form.
 * Admin-gated; capped so the Select stays practical.
 */
export async function getEvidenceOwnerOptions(): Promise<
  { status: "forbidden" } | { status: "ok"; owners: EvidenceOwnerOption[] }
> {
  const supabase = await createClient();
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError) throw adminError;
  if (!isAdmin) return { status: "forbidden" };

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .order("full_name", { ascending: true, nullsFirst: false })
    .order("email", { ascending: true })
    .limit(OWNER_OPTION_LIMIT);

  if (error) throw error;

  return { status: "ok", owners: (data ?? []) as EvidenceOwnerOption[] };
}
