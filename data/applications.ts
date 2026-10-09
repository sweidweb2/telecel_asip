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
  Application,
  ApplicationListItem,
  ApplicationListResult,
} from "@/types/application";
import {
  deleteApplicationSchema,
  type ApplicationListQuery,
} from "@/validations/application";

const APPLICATION_LIST_COLUMNS =
  "id, full_name, email, company_name, inbox_status, created_at" as const;

const APPLICATION_DETAIL_COLUMNS =
  "id, full_name, founder_role, email, phone, country, linkedin, company_name, website, company_country, sector, problem_product, traction, programme_fit, consent, comms_opt_in, inbox_status, created_at" as const;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchApplications(
  supabase: ServerClient,
  query: ApplicationListQuery,
): Promise<ApplicationListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("applications")
    .select(APPLICATION_LIST_COLUMNS, { count: "estimated" })
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
    applications: (data ?? []) as ApplicationListItem[],
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
  return gateEditorPageData(
    async (supabase) => {
      const [list, stats] = await Promise.all([
        fetchApplications(supabase, query),
        fetchInboxTableStats(supabase, "applications"),
      ]);
      return { list, stats };
    }
  );
}

export async function getApplicationById(
  id: string,
): Promise<
  | { status: "forbidden" }
  | { status: "not_found" }
  | { status: "ok"; record: Application }
> {
  if (!deleteApplicationSchema.safeParse({ id }).success) {
    return { status: "not_found" };
  }

  const gated = await gateEditorPageData(
    async (supabase) => {
      const { data, error } = await supabase
        .from("applications")
        .select(APPLICATION_DETAIL_COLUMNS)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return { record: (data as Application | null) ?? null };
    }
  );

  if (gated.status === "forbidden") return gated;
  if (!gated.record) return { status: "not_found" };
  return { status: "ok", record: gated.record };
}
