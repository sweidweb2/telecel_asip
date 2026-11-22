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
  InvestorEngagement,
  InvestorEngagementListItem,
  InvestorEngagementListResult,
} from "@/types/investor-engagement";
import {
  deleteInvestorEngagementSchema,
  type InvestorEngagementListQuery,
} from "@/validations/investor-engagement";

const INVESTOR_ENGAGEMENT_LIST_COLUMNS =
  "id, full_name, email, organization, inbox_status, created_at" as const;

const INVESTOR_ENGAGEMENT_DETAIL_COLUMNS =
  "id, full_name, email, phone, organization, job_title, linkedin, investor_type, stages, ticket_size, sectors, geographies, engagement_intent, thesis, timeline, referred_by, message, consent, comms_opt_in, locale, source_path, consent_version, inbox_status, created_at" as const;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchInvestorEngagements(
  supabase: ServerClient,
  query: InvestorEngagementListQuery,
): Promise<InvestorEngagementListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("investor_engagements")
    .select(INVESTOR_ENGAGEMENT_LIST_COLUMNS, { count: "estimated" })
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
    engagements: (data ?? []) as InvestorEngagementListItem[],
    total,
    totalPages: adminListTotalPages(total, query.pageSize),
  };
}

export async function getInvestorEngagementsPageData(
  query: InvestorEngagementListQuery,
): Promise<
  | { status: "forbidden" }
  | {
      status: "ok";
      list: InvestorEngagementListResult;
      stats: InboxTableStats;
    }
> {
  return gateEditorPageData(async (supabase) => {
    const [list, stats] = await Promise.all([
      fetchInvestorEngagements(supabase, query),
      fetchInboxTableStats(supabase, "investor_engagements"),
    ]);
    return { list, stats };
  });
}

export async function getInvestorEngagementById(
  id: string,
): Promise<
  | { status: "forbidden" }
  | { status: "not_found" }
  | { status: "ok"; record: InvestorEngagement }
> {
  if (!deleteInvestorEngagementSchema.safeParse({ id }).success) {
    return { status: "not_found" };
  }

  const gated = await gateEditorPageData(async (supabase) => {
    const { data, error } = await supabase
      .from("investor_engagements")
      .select(INVESTOR_ENGAGEMENT_DETAIL_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return { record: (data as InvestorEngagement | null) ?? null };
  });

  if (gated.status === "forbidden") return gated;
  if (!gated.record) return { status: "not_found" };
  return { status: "ok", record: gated.record };
}
