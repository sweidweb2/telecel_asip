import {
  adminListRange,
  adminListTotalPages,
  gateEditorPageData,
} from "@/lib/admin/admin-list-query";
import { applyInboxStatusFilter } from "@/lib/admin/apply-inbox-status-filter";
import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { createClient } from "@/lib/supabase/server";
import {
  fetchInboxTableStats,
  type InboxTableStats,
} from "@/data/inbox-stats";
import type {
  InterestRegistration,
  InterestRegistrationListItem,
  InterestRegistrationListResult,
} from "@/types/interest-registration";
import {
  deleteInterestRegistrationSchema,
  type InterestRegistrationListQuery,
} from "@/validations/interest-registration";

const REGISTRATION_LIST_COLUMNS =
  "id, full_name, email, company_name, inbox_status, created_at" as const;

const REGISTRATION_DETAIL_COLUMNS =
  "id, full_name, founder_role, email, phone, country, linkedin, company_name, website, company_country, sector, pitch, consent, comms_opt_in, locale, source_path, consent_version, inbox_status, created_at" as const;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchInterestRegistrations(
  supabase: ServerClient,
  query: InterestRegistrationListQuery,
): Promise<InterestRegistrationListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("interest_registrations")
    .select(REGISTRATION_LIST_COLUMNS, { count: "estimated" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  request = applyInboxStatusFilter(request, query.inboxStatus);

  if (query.search) {
    const pattern = escapeIlikePattern(query.search);
    request = request.or(
      `full_name.ilike."%${pattern}%",email.ilike."%${pattern}%",company_name.ilike."%${pattern}%"`,
    );
  }

  const { data, count, error } = await request;
  if (error) throw error;

  const total = count ?? 0;
  return {
    registrations: (data ?? []) as InterestRegistrationListItem[],
    total,
    totalPages: adminListTotalPages(total, query.pageSize),
  };
}

export async function getInterestRegistrationsPageData(
  query: InterestRegistrationListQuery,
): Promise<
  | { status: "forbidden" }
  | {
      status: "ok";
      list: InterestRegistrationListResult;
      stats: InboxTableStats;
    }
> {
  return gateEditorPageData(
    async (supabase) => {
      const [list, stats] = await Promise.all([
        fetchInterestRegistrations(supabase, query),
        fetchInboxTableStats(supabase, "interest_registrations"),
      ]);
      return { list, stats };
    }
  );
}

export async function getInterestRegistrationById(
  id: string,
): Promise<
  | { status: "forbidden" }
  | { status: "not_found" }
  | { status: "ok"; record: InterestRegistration }
> {
  if (!deleteInterestRegistrationSchema.safeParse({ id }).success) {
    return { status: "not_found" };
  }

  const gated = await gateEditorPageData(
    async (supabase) => {
      const { data, error } = await supabase
        .from("interest_registrations")
        .select(REGISTRATION_DETAIL_COLUMNS)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return { record: (data as InterestRegistration | null) ?? null };
    }
  );

  if (gated.status === "forbidden") return gated;
  if (!gated.record) return { status: "not_found" };
  return { status: "ok", record: gated.record };
}
