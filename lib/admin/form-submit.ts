import type { FieldErrors } from "react-hook-form";

/**
 * Disable admin create/edit submit while pending, pristine, or showing field errors.
 *
 * Uses `errors` (not `isValid`): with Zod resolvers, `isValid` often stays false
 * even for good edit defaults, which permanently blocks Save.
 * Pair with `mode: "onChange"` so errors update as the user types.
 *
 * `hasExternalChanges` covers pending media (logo/cover/avatar File state) that
 * lives outside react-hook-form and must still unlock Save / Create.
 */
export function isAdminFormSubmitDisabled({
  isPending,
  isDirty,
  errors,
  hasExternalChanges = false,
}: {
  isPending: boolean;
  isDirty: boolean;
  errors: FieldErrors;
  /** Pending uploads or other out-of-band edits (images, etc.). */
  hasExternalChanges?: boolean;
}): boolean {
  const hasChanges = isDirty || hasExternalChanges;
  return isPending || !hasChanges || Object.keys(errors).length > 0;
}
