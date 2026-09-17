"use client";

import type { ReactNode } from "react";

import { useSidebarLayout } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

/**
 * Bottom padding so the last form fields stay clear of the fixed actions bar.
 * Mobile stacks full-width buttons (taller bar); desktop is a single row.
 */
export const ADMIN_EDITOR_ACTIONS_SAFE_AREA =
  "pb-[calc(8.75rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(5rem+env(safe-area-inset-bottom,0px))]";

/**
 * Fixed bottom action row for admin create/edit forms (Save / Delete).
 * Render as the last child inside the `<form>` so `type="submit"` still works.
 */
export function AdminEditorActionsBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { state, isMobile } = useSidebarLayout();

  return (
    <div
      role="region"
      aria-label="Form actions"
      className={cn(
        "fixed right-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur transition-[left] duration-200 ease-linear supports-backdrop-filter:bg-background/80",
        "px-4 pt-3 sm:px-6",
        "pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]",
        isMobile
          ? "left-0"
          : state === "collapsed"
            ? "left-(--sidebar-width-icon)"
            : "left-(--sidebar-width)",
        className,
      )}
    >
      <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        {children}
      </div>
    </div>
  );
}
