import type { ReactNode } from "react";

import { StaffMain } from "@/components/dashboard/skip-to-content";

type AdminListPageShellProps = {
  /**
   * Kept for call-site compatibility and screen-reader context.
   * The visible primary title lives in `StaffHeader`.
   */
  title: string;
  actions?: ReactNode;
  children: ReactNode;
};

/**
 * Shared CMS list page chrome: optional actions (no duplicate h2 / page blurb).
 * Single page `<main>` (SidebarInset is a layout div, not a landmark).
 */
export function AdminListPageShell({
  title,
  actions,
  children,
}: AdminListPageShellProps) {
  return (
    <StaffMain aria-label={title}>
      {actions ? (
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {actions}
        </div>
      ) : null}
      {children}
    </StaffMain>
  );
}
