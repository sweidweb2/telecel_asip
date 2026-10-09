import { cache } from "react";

import { getAuthUser } from "@/data/auth";
import {
  adminListRange,
  adminListTotalPages,
  gateStaffPageData,
} from "@/lib/admin/admin-list-query";
import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { getStaffShell } from "@/lib/admin/get-staff-shell";
import { adminOrderAscending } from "@/lib/admin/list-sort";
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

type ServerClient = Awaited<ReturnType<typeof createClient>>;

type UsersVisibility = {
  /** Editors never list or count administrator profiles. */
  hideAdmins: boolean;
};

async function fetchUsers(
  supabase: ServerClient,
  query: UserListQuery,
  visibility: UsersVisibility,
): Promise<UserListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);
  const roleFilter =
    visibility.hideAdmins && query.role === "admin" ? "all" : query.role;

  let request = supabase
    .from("profiles")
    .select(USER_COLUMNS, { count: "estimated" })
    .order(query.sort, { ascending: adminOrderAscending(query.dir) })
    .order("id", { ascending: true });

  if (visibility.hideAdmins) {
    request = request.neq("role", "admin");
  }

  if (roleFilter !== "all") {
    request = request.eq("role", roleFilter);
  }

  if (query.search) {
    const pattern = escapeIlikePattern(query.search);
    request = request.or(
      `full_name.ilike.%${pattern}%,email.ilike.%${pattern}%`,
    );
  }

  const { data, count, error } = await request.range(from, to);
  if (error) throw error;

  const total = count ?? 0;
  return {
    users: (data ?? []) as Profile[],
    total,
    totalPages: adminListTotalPages(total, query.pageSize),
  };
}

async function fetchUserStats(
  supabase: ServerClient,
  visibility: UsersVisibility,
): Promise<UserStats> {
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

  const stats: UserStats = {
    total: Number(row.total ?? 0),
    admins: Number(row.admins ?? 0),
    editors: Number(row.editors ?? 0),
    viewers: Number(row.viewers ?? 0),
    newThisWeek: Number(row.new_this_week ?? 0),
    newThisMonth: Number(row.new_this_month ?? 0),
  };

  // RLS + invoker RPC already hide admin rows for editors; zero explicitly
  // so the editor shell never surfaces an admin count.
  if (visibility.hideAdmins) {
    return { ...stats, admins: 0 };
  }

  return stats;
}

/**
 * Staff gate then list + stats in parallel on a shared client.
 * Editors never receive administrator rows (query filter + RLS).
 */
export async function getUsersPageData(query: UserListQuery): Promise<
  | { status: "forbidden" }
  | { status: "ok"; list: UserListResult; stats: UserStats }
> {
  return gateStaffPageData(
    async (supabase) => {
      const shell = await getStaffShell();
      const hideAdmins = shell.isEditor && !shell.isAdmin;
      const visibility = { hideAdmins };

      const [list, stats] = await Promise.all([
        fetchUsers(supabase, query, visibility),
        fetchUserStats(supabase, visibility),
      ]);
      return { list, stats };
    }
  );
}
