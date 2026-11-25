/**
 * Canonical auth import for `app/`, `components/`, and `data/`.
 * Implementation lives in `lib/admin` (staff kernel); keep `lib/admin/**` and
 * `actions/` on direct `@/lib/admin/*` imports to avoid a data↔lib cycle.
 */

export { getAuthUser } from "@/lib/admin/get-auth-user";
export {
  isCurrentUserAdmin,
  isCurrentUserEditor,
  isCurrentUserStaff,
} from "@/lib/admin/current-user-role";
export {
  requireAdmin,
  requireEditor,
} from "@/lib/admin/require-staff";
