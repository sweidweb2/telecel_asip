import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";

/**
 * Two-column row whose children share label / control / error tracks, so a
 * label that wraps in one column never pushes its sibling's input out of line.
 */
export const ADMIN_FORM_PAIR_ROW =
  "grid grid-cols-1 gap-5 sm:grid-cols-2 sm:grid-rows-[auto_auto_auto] sm:gap-x-5 sm:gap-y-2";

export const ADMIN_FORM_PAIR_FIELD =
  "sm:row-span-3 sm:grid sm:grid-rows-subgrid";

/** Label with the field's own constraints spelled out beside it. */
export function AdminFormFieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: ReactNode;
  hint: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
      <Label htmlFor={htmlFor}>{children}</Label>
      <span className="text-[0.6875rem] leading-4 text-muted-foreground">
        {hint}
      </span>
    </div>
  );
}
