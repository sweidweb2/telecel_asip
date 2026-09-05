import { createClient } from "@/lib/supabase/server";
import type {
  Application,
  ApplicationListResult,
} from "@/types/application";
import type { ApplicationListQuery } from "@/validations/application";

const APPLICATION_COLUMNS =
  "id, full_name, founder_role, email, phone, country, linkedin, company_name, website, company_country, sector, problem_product, traction, programme_fit, consent, comms_opt_in, created_at" as const;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchApplications(
  supabase: ServerClient,
  query: ApplicationListQuery,
): Promise<ApplicationListResult> {
  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize - 1;

  let request = supabase
    .from("applications")
    .select(APPLICATION_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

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
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getApplicationsPageData(
  query: ApplicationListQuery,
): Promise<
  { status: "forbidden" } | { status: "ok"; list: ApplicationListResult }
> {
  const supabase = await createClient();

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError) throw adminError;
  if (!isAdmin) return { status: "forbidden" };

  const list = await fetchApplications(supabase, query);
  return { status: "ok", list };
}
