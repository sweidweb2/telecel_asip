import { startOfMonth, startOfWeek } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import type { Profile, UserListResult, UserStats } from "@/types/profile";
import type { UserListQuery } from "@/validations/users";

const USER_COLUMNS = "id, email, full_name, role, created_at, updated_at";

export async function getUsers(query: UserListQuery): Promise<UserListResult> {
  const supabase = await createClient();
  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize - 1;

  let request = supabase
    .from("profiles")
    .select(USER_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (query.role !== "all") {
    request = request.eq("role", query.role);
  }

  if (query.search) {
    request = request.or(
      `full_name.ilike.%${query.search}%,email.ilike.%${query.search}%`,
    );
  }

  const { data, count, error } = await request;
  if (error) throw error;

  const total = count ?? 0;
  return {
    users: (data ?? []) as Profile[],
    total,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getUserStats(): Promise<UserStats> {
  const supabase = await createClient();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
  const monthStart = startOfMonth(new Date()).toISOString();

  const countQuery = () =>
    supabase.from("profiles").select("id", { count: "exact", head: true });

  const [total, admins, editors, viewers, week, month] = await Promise.all([
    countQuery(),
    countQuery().eq("role", "admin"),
    countQuery().eq("role", "editor"),
    countQuery().eq("role", "viewer"),
    countQuery().gte("created_at", weekStart),
    countQuery().gte("created_at", monthStart),
  ]);

  const results = [total, admins, editors, viewers, week, month];
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;

  return {
    total: total.count ?? 0,
    admins: admins.count ?? 0,
    editors: editors.count ?? 0,
    viewers: viewers.count ?? 0,
    newThisWeek: week.count ?? 0,
    newThisMonth: month.count ?? 0,
  };
}
