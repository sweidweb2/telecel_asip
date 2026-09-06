import type { ReactNode } from "react";

function isEmptyDetail(children: ReactNode): boolean {
  if (children == null || children === false) return true;
  if (typeof children === "string") return children.trim().length === 0;
  return false;
}

/** Label + value row for admin view dialogs / detail panels. */
export function AdminDetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const empty = isEmptyDetail(children);

  return (
    <div className="grid gap-1">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm break-words whitespace-pre-wrap">
        {empty ? (
          <span className="text-muted-foreground">Not provided</span>
        ) : (
          children
        )}
      </dd>
    </div>
  );
}
