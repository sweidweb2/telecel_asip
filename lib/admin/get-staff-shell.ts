import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type StaffRole = Database["public"]["Enums"]["user_role"];

export type StaffShell = {
  role: StaffRole | null;
  isAdmin: boolean;
  isEditor: boolean;
  fullName: string | null;
  email: string | null;
};

/**
 * One round-trip for editor/admin chrome: role flags + display profile fields.
 * Request-memoized so layout gates and `isCurrentUser*` helpers share one RPC.
 *
 * Prefers `get_staff_shell`; falls back to expanded `get_admin_shell` when
 * PostgREST’s schema cache is briefly stale after a migration (PGRST202).
 */
export const getStaffShell = cache(async (): Promise<StaffShell> => {
  const supabase = await createClient();
  const primary = await supabase.rpc("get_staff_shell").maybeSingle();

  const result =
    primary.error?.code === "PGRST202"
      ? await supabase.rpc("get_admin_shell").maybeSingle()
      : primary;

  if (result.error) throw result.error;

  const data = result.data;

  return {
    role: data?.role ?? null,
    isAdmin: Boolean(data?.is_admin),
    isEditor: Boolean(data?.is_editor),
    fullName: data?.full_name ?? null,
    email: data?.email ?? null,
  };
});
