import type { ReactNode } from "react";

/** Page-section label shared by dashboard, analytics, and admin tools. */
export function AdminSectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </h2>
  );
}
