import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Landmark id for staff main content — target of the skip link. */
export const STAFF_MAIN_ID = "main-content";

/**
 * First focusable control in staff shells. Visually hidden until focused,
 * then jumps past the sidebar to `#main-content`.
 */
export function SkipToContent({
  className,
  href = `#${STAFF_MAIN_ID}`,
}: {
  className?: string;
  href?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100]",
        "focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium",
        "focus:text-foreground focus:shadow-md focus:ring-2 focus:ring-ring focus:outline-none",
        className,
      )}
    >
      Skip to main content
    </a>
  );
}

/**
 * Single page `<main>` for staff routes (list shell and editors).
 * SidebarInset is a layout div — do not nest another main inside it.
 */
export function StaffMain({
  className,
  children,
  ...props
}: ComponentProps<"main">) {
  return (
    <main
      id={STAFF_MAIN_ID}
      tabIndex={-1}
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6 outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </main>
  );
}
