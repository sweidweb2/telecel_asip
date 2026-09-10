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

export type AdminEditorStepFields = readonly {
  id: string;
  fields: readonly string[];
}[];

function errorHasPath(errors: FieldErrors, path: string): boolean {
  const parts = path.split(".");
  let current: unknown = errors;
  for (const part of parts) {
    if (!current || typeof current !== "object") return false;
    current = (current as Record<string, unknown>)[part];
  }
  return current != null;
}

/**
 * First stepper panel that owns a field present in RHF `errors`.
 * Used when inactive steps are unmounted so Save can still surface the
 * invalid panel instead of requiring every field to stay in the DOM.
 */
export function firstInvalidEditorStep(
  errors: FieldErrors,
  steps: AdminEditorStepFields,
): string | undefined {
  if (Object.keys(errors).length === 0) return undefined;

  for (const step of steps) {
    if (step.fields.some((field) => errorHasPath(errors, field))) {
      return step.id;
    }
  }

  return steps[0]?.id;
}
