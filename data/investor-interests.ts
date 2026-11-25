import {
  adminListRange,
  adminListTotalPages,
  gatePageDataByRole,
} from "@/lib/admin/admin-list-query";
import { applyInboxStatusFilter } from "@/lib/admin/apply-inbox-status-filter";
import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { createClient } from "@/lib/supabase/server";
import {
  fetchInboxTableStats,
  type InboxTableStats,
} from "@/data/inbox-stats";
import type {
  InvestorInterest,
  InvestorInterestListItem,
  InvestorInterestListResult,
} from "@/types/investor-interest";
import {
  deleteInvestorInterestSchema,
  type InvestorInterestListQuery,
} from "@/validations/investor-interest";

const INVESTOR_INTEREST_LIST_COLUMNS =
  "id, full_name, email, organization, inbox_status, created_at" as const;

const INVESTOR_INTEREST_DETAIL_COLUMNS =
  "id, full_name, email, phone, organization, job_title, linkedin, investor_type, focus_note, consent, comms_opt_in, locale, source_path, consent_version, inbox_status, created_at" as const;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchInvestorInterests(
  supabase: ServerClient,
  query: InvestorInterestListQuery,
): Promise<InvestorInterestListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("investor_interests")
    .select(INVESTOR_INTEREST_LIST_COLUMNS, { count: "estimated" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  request = applyInboxStatusFilter(request, query.inboxStatus);

  if (query.search) {
    const pattern = escapeIlikePattern(query.search);
    request = request.or(
      `full_name.ilike."%${pattern}%",email.ilike."%${pattern}%",organization.ilike."%${pattern}%"`,
    );
  }

  const { data, count, error } = await request;
  if (error) throw error;

  const total = count ?? 0;
  return {
    interests: (data ?? []) as InvestorInterestListItem[],
    total,
    totalPages: adminListTotalPages(total, query.pageSize),
  };
}

export async function getInvestorInterestsPageData(
  query: InvestorInterestListQuery,
): Promise<
  | { status: "forbidden" }
  | {
      status: "ok";
      list: InvestorInterestListResult;
      stats: InboxTableStats;
    }
> {
  return gatePageDataByRole("editor", async (supabase) => {
    const [list, stats] = await Promise.all([
      fetchInvestorInterests(supabase, query),
      fetchInboxTableStats(supabase, "investor_interests"),
    ]);
    return { list, stats };
  });
}

export async function getInvestorInterestById(
  id: string,
): Promise<
  | { status: "forbidden" }
  | { status: "not_found" }
  | { status: "ok"; record: InvestorInterest }
> {
  if (!deleteInvestorInterestSchema.safeParse({ id }).success) {
    return { status: "not_found" };
  }

  const gated = await gatePageDataByRole("editor", async (supabase) => {
    const { data, error } = await supabase
      .from("investor_interests")
      .select(INVESTOR_INTEREST_DETAIL_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return { record: (data as InvestorInterest | null) ?? null };
  });

  if (gated.status === "forbidden") return gated;
  if (!gated.record) return { status: "not_found" };
  return { status: "ok", record: gated.record };
}
