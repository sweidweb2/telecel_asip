import type { ReactNode } from "react";

type AdminListPageShellProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

/**
 * Shared CMS list page chrome: padded main + title/description + optional actions.
 */
export function AdminListPageShell({
  title,
  description,
  actions,
  children,
}: AdminListPageShellProps) {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div
        className={
          actions
            ? "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            : "min-w-0"
        }
      >
        <div className="min-w-0">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {actions}
      </div>
      {children}
    </main>
  );
}
