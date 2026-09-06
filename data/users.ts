import { cache } from "react";

import { getAuthUser } from "@/data/auth";
import {
  adminListRange,
  adminListTotalPages,
  gateAdminPageData,
} from "@/lib/admin/admin-list-query";
import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { createClient } from "@/lib/supabase/server";
import type {
  CurrentUserProfile,
  Profile,
  UserListResult,
  UserStats,
} from "@/types/profile";
import type { UserListQuery } from "@/validations/users";

const USER_COLUMNS = "id, email, full_name, role, created_at, updated_at" as const;

const CURRENT_USER_COLUMNS = "id, email, full_name, role" as const;

/**
 * Signed-in user's own profile for the dashboard chrome.
 * Memoized per request — the sidebar and the header both need it.
 */
export const getCurrentUserProfile = cache(
  async (): Promise<CurrentUserProfile | null> => {
    const authUser = await getAuthUser();
    if (!authUser) return null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(CURRENT_USER_COLUMNS)
      .eq("id", authUser.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
);

export async function getUsers(query: UserListQuery): Promise<UserListResult> {
  const supabase = await createClient();
  return fetchUsers(supabase, query);
}

/**
 * Per-request memoization only.
 * Stats are one RPC (`get_user_stats`) — not four head-count round trips.
 */
export const getUserStats = cache(async (): Promise<UserStats> => {
  const supabase = await createClient();
  return fetchUserStats(supabase);
});

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchUsers(
  supabase: ServerClient,
  query: UserListQuery,
): Promise<UserListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("profiles")
    .select(USER_COLUMNS, { count: "estimated" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (query.role !== "all") {
    request = request.eq("role", query.role);
  }

  if (query.search) {
    const pattern = escapeIlikePattern(query.search);
    request = request.or(
      `full_name.ilike.%${pattern}%,email.ilike.%${pattern}%`,
    );
  }

  const { data, count, error } = await request;
  if (error) throw error;

  const total = count ?? 0;
  return {
    users: (data ?? []) as Profile[],
    total,
    totalPages: adminListTotalPages(total, query.pageSize),
  };
}

async function fetchUserStats(supabase: ServerClient): Promise<UserStats> {
  const { data, error } = await supabase.rpc("get_user_stats");
  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return {
      total: 0,
      admins: 0,
      editors: 0,
      viewers: 0,
      newThisWeek: 0,
      newThisMonth: 0,
    };
  }

  return {
    total: Number(row.total ?? 0),
    admins: Number(row.admins ?? 0),
    editors: Number(row.editors ?? 0),
    viewers: Number(row.viewers ?? 0),
    newThisWeek: Number(row.new_this_week ?? 0),
    newThisMonth: Number(row.new_this_month ?? 0),
  };
}

/**
 * Admin gate then list + stats in parallel on a shared client.
 */
export async function getUsersPageData(query: UserListQuery): Promise<
  | { status: "forbidden" }
  | { status: "ok"; list: UserListResult; stats: UserStats }
> {
  return gateAdminPageData(
    async (supabase) => {
      const [list, stats] = await Promise.all([
        fetchUsers(supabase, query),
        fetchUserStats(supabase),
      ]);
      return { list, stats };
    },
    { name: "getUsersPageData" },
  );
}
