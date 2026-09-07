import {
  adminListRange,
  adminListTotalPages,
  gateAdminPageData,
} from "@/lib/admin/admin-list-query";
import { applyInboxStatusFilter } from "@/lib/admin/apply-inbox-status-filter";
import { createClient } from "@/lib/supabase/server";
import {
  fetchInboxTableStats,
  type InboxTableStats,
} from "@/data/inbox-stats";
import type {
  Application,
  ApplicationListResult,
} from "@/types/application";
import type { ApplicationListQuery } from "@/validations/application";

const APPLICATION_COLUMNS =
  "id, full_name, founder_role, email, phone, country, linkedin, company_name, website, company_country, sector, problem_product, traction, programme_fit, consent, comms_opt_in, inbox_status, created_at" as const;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchApplications(
  supabase: ServerClient,
  query: ApplicationListQuery,
): Promise<ApplicationListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("applications")
    .select(APPLICATION_COLUMNS, { count: "estimated" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  request = applyInboxStatusFilter(request, query.inboxStatus);

  if (query.search) {
    request = request.or(
      `full_name.ilike.%${query.search}%,email.ilike.%${query.search}%,company_name.ilike.%${query.search}%`,
    );
  }

  const { data, count, error } = await request;
  if (error) throw error;

  const total = count ?? 0;
  return {
    applications: (data ?? []) as Application[],
    total,
    totalPages: adminListTotalPages(total, query.pageSize),
  };
}

export async function getApplicationsPageData(
  query: ApplicationListQuery,
): Promise<
  | { status: "forbidden" }
  | { status: "ok"; list: ApplicationListResult; stats: InboxTableStats }
> {
  return gateAdminPageData(
    async (supabase) => {
      const [list, stats] = await Promise.all([
        fetchApplications(supabase, query),
        fetchInboxTableStats(supabase, "applications"),
      ]);
      return { list, stats };
    },
    { name: "getApplicationsPageData" },
  );
}
