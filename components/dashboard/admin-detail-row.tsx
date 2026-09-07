import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

function isEmptyDetail(children: ReactNode): boolean {
  if (children == null || children === false) return true;
  if (typeof children === "string") return children.trim().length === 0;
  return false;
}

/** Label + value row for admin view dialogs / detail panels. */
export function AdminDetailRow({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const empty = isEmptyDetail(children);

  return (
    <div className={cn("grid min-w-0 gap-1", className)}>
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 text-sm leading-6 wrap-break-word whitespace-pre-wrap [overflow-wrap:anywhere]">
        {empty ? (
          <span className="text-muted-foreground">Not provided</span>
        ) : (
          children
        )}
      </dd>
    </div>
  );
}

/** Grouped block with a quiet section title for inbox view dialogs. */
export function AdminDetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid min-w-0 gap-3">
      <h3 className="border-b border-border pb-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** Two-column grid for short fields; stacks on narrow dialogs. */
export function AdminDetailGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
      {children}
    </div>
  );
}

/** Shared shell classes for inbox eye-view dialogs. */
export const ADMIN_INBOX_VIEW_DIALOG_CLASS =
  "max-h-[90vh] w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto sm:max-w-2xl";
