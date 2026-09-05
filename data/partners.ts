import { cache } from "react";
import { unstable_cache } from "next/cache";

import {
  adminListRange,
  adminListTotalPages,
} from "@/lib/admin/admin-list-query";
import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import type {
  Partner,
  PartnerListItem,
  PartnerListResult,
  PartnerPublicGroups,
  PartnerPublicItem,
} from "@/types/partner";
import { partnerIdSchema, type PartnerListQuery } from "@/validations/partner";

export const PARTNERS_CACHE_TAG = "partners";

const LIST_COLUMNS =
  "id, name, org, type, contribution, is_active, logo_permission, logo_url, link, sort_order, created_at, updated_at" as const;

/**
 * Read from `partners_public`, not the base table: the view nulls `logo_url`
 * when publication permission is missing and never exposes `logo_permission`
 * or `contribution` to `anon`.
 */
const PUBLIC_COLUMNS =
  "id, name, org, type, link, logo_url, is_active, sort_order" as const;

/** Upper bound so one bad import cannot make the public page unbounded. */
const PUBLIC_LIMIT = 500;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchPartnersPage(
  supabase: ServerClient,
  query: PartnerListQuery,
): Promise<PartnerListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("partners")
    .select(LIST_COLUMNS, { count: "estimated" })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (query.type !== "all") {
    request = request.eq("type", query.type);
  }

  if (query.status !== "all") {
    request = request.eq("is_active", query.status === "active");
  }

  if (query.search) {
    const pattern = escapeIlikePattern(query.search);
    request = request.or(
      `name.ilike."%${pattern}%",org.ilike."%${pattern}%"`,
    );
  }

  const { data, count, error } = await request;
  if (error) throw error;

  const total = count ?? 0;
  return {
    partners: (data ?? []) as PartnerListItem[],
    total,
    totalPages: adminListTotalPages(total, query.pageSize),
  };
}

export async function getPartnersPageData(
  query: PartnerListQuery,
): Promise<
  { status: "forbidden" } | { status: "ok"; list: PartnerListResult }
> {
  const supabase = await createClient();

  // RLS already restricts the rows, so the list can run alongside the role
  // check instead of waiting a full round trip for it.
  const [isAdmin, list] = await Promise.all([
    isCurrentUserAdmin(),
    fetchPartnersPage(supabase, query),
  ]);

  if (!isAdmin) return { status: "forbidden" };

  return { status: "ok", list };
}

type PartnerDetailResult =
  | { status: "forbidden" }
  | { status: "not_found" }
  | { status: "ok"; partner: Partner };

/**
 * Deduped per request: `generateMetadata` and the page body both need the same
 * partner, and without `cache()` that is two role checks plus two selects.
 */
export const getPartnerByIdForAdmin = cache(
  async (id: string): Promise<PartnerDetailResult> => {
    // An id that is not a uuid would make Postgres raise 22P02, surfacing a
    // crash where the route should simply render its not-found page.
    if (!partnerIdSchema.safeParse(id).success) return { status: "not_found" };

    const supabase = await createClient();
    if (!(await isCurrentUserAdmin())) return { status: "forbidden" };

    const { data, error } = await supabase
      .from("partners")
      .select(LIST_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { status: "not_found" };

    return { status: "ok", partner: data as Partner };
  },
);

type PublicRow = Pick<
  Tables<"partners_public">,
  "id" | "name" | "org" | "type" | "link" | "logo_url" | "is_active"
>;

function toPublicItem(row: PublicRow): PartnerPublicItem | null {
  if (!row.id || !row.name || !row.type) return null;

  return {
    id: row.id,
    name: row.name,
    org: row.org,
    type: row.type,
    link: row.link,
    logo_url: row.logo_url,
  };
}

async function fetchPublicPartners(): Promise<PartnerPublicGroups> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("partners_public")
    .select(PUBLIC_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(PUBLIC_LIMIT);

  if (error) throw error;

  const rows = (data ?? []) as PublicRow[];
  const active: PartnerPublicItem[] = [];
  const historical: PartnerPublicItem[] = [];

  for (const row of rows) {
    const item = toPublicItem(row);
    if (!item) continue;
    (row.is_active ? active : historical).push(item);
  }

  return { active, historical };
}

/**
 * Every partner for the public page, split into active and historical. The
 * whole list is small and unfiltered, so one cached read serves both locales.
 */
export const getPublicPartners = unstable_cache(
  fetchPublicPartners,
  ["public-partners"],
  { tags: [PARTNERS_CACHE_TAG], revalidate: 300 },
);
