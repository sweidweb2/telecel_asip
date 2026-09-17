"use client";

import type { KeyboardEvent, ReactNode } from "react";

import { TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type AdminClickableRowProps = {
  onActivate: () => void;
  /** Accessible name describing what activating the row does. */
  ariaLabel: string;
  className?: string;
  children: ReactNode;
};

/**
 * Table body row that opens on click, Enter, or Space (keyboard parity with mouse).
 */
export function AdminClickableRow({
  onActivate,
  ariaLabel,
  className,
  children,
}: AdminClickableRowProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLTableRowElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate();
    }
  }

  return (
    <TableRow
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={cn(
        "cursor-pointer focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none",
        className,
      )}
      onClick={onActivate}
      onKeyDown={handleKeyDown}
    >
      {children}
    </TableRow>
  );
}
