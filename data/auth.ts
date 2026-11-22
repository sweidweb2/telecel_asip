/**
 * Auth helpers for route gates and staff checks.
 * Implementation lives in `lib/admin` (staff kernel); this file re-exports for
 * `data/` / `app/` consumers that already import from `@/data/auth`.
 */

export { getAuthUser } from "@/lib/admin/get-auth-user";
export { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
export { isCurrentUserEditor } from "@/lib/admin/is-current-user-editor";
export { isCurrentUserStaff } from "@/lib/admin/is-current-user-staff";
export {
  requireAdmin,
  requireEditor,
} from "@/lib/admin/require-staff";
