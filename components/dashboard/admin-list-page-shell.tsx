import type { ReactNode } from "react";

type AdminListPageShellProps = {
  /**
   * Kept for call-site compatibility and screen-reader context.
   * The visible primary title lives in `DashboardHeader`.
   */
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

/**
 * Shared CMS list page chrome: description + optional actions (no duplicate h2).
 */
export function AdminListPageShell({
  title,
  description,
  actions,
  children,
}: AdminListPageShellProps) {
  return (
    <main
      className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6"
      aria-label={title}
    >
      <div
        className={
          actions
            ? "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
            : "min-w-0"
        }
      >
        <p className="min-w-0 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
        {actions}
      </div>
      {children}
    </main>
  );
}
