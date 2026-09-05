import {
  adminListRange,
  adminListTotalPages,
  gateAdminPageData,
} from "@/lib/admin/admin-list-query";
import { createClient } from "@/lib/supabase/server";
import type {
  InterestRegistration,
  InterestRegistrationListResult,
} from "@/types/interest-registration";
import type { InterestRegistrationListQuery } from "@/validations/interest-registration";

const REGISTRATION_COLUMNS =
  "id, full_name, founder_role, email, phone, country, linkedin, company_name, website, company_country, sector, pitch, consent, comms_opt_in, created_at" as const;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchInterestRegistrations(
  supabase: ServerClient,
  query: InterestRegistrationListQuery,
): Promise<InterestRegistrationListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("interest_registrations")
    .select(REGISTRATION_COLUMNS, { count: "estimated" })
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
    registrations: (data ?? []) as InterestRegistration[],
    total,
    totalPages: adminListTotalPages(total, query.pageSize),
  };
}

export async function getInterestRegistrationsPageData(
  query: InterestRegistrationListQuery,
): Promise<
  | { status: "forbidden" }
  | { status: "ok"; list: InterestRegistrationListResult }
> {
  return gateAdminPageData(async (supabase) => {
    const list = await fetchInterestRegistrations(supabase, query);
    return { list };
  });
}
