import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type AdminShell = {
  isAdmin: boolean;
  fullName: string | null;
  email: string | null;
};

/**
 * One round-trip for dashboard chrome: is_admin + display profile fields.
 * Request-memoized so nested spans share the same shell row.
 */
export const getAdminShell = cache(async (): Promise<AdminShell> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_shell").maybeSingle();

  if (error) throw error;

  return {
    isAdmin: Boolean(data?.is_admin),
    fullName: data?.full_name ?? null,
    email: data?.email ?? null,
  };
});
