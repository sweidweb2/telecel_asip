import type { ReactNode } from "react";

type AdminListPageShellProps = {
  /**
   * Kept for call-site compatibility and screen-reader context.
   * The visible primary title lives in `DashboardHeader`.
   */
  title: string;
  actions?: ReactNode;
  children: ReactNode;
};

/**
 * Shared CMS list page chrome: optional actions (no duplicate h2 / page blurb).
 */
export function AdminListPageShell({
  title,
  actions,
  children,
}: AdminListPageShellProps) {
  return (
    <main
      className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6"
      aria-label={title}
    >
      {actions ? (
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {actions}
        </div>
      ) : null}
      {children}
    </main>
  );
}
