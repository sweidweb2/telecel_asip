"use client";

import { XIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminClearIconButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Small overlay clear control for media previews and compact pickers.
 * Place inside a `relative` holder; default sits top-right of the frame.
 */
export function AdminClearIconButton({
  label,
  onClick,
  disabled = false,
  className,
}: AdminClearIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={cn(
        buttonVariants({ variant: "secondary", size: "icon-xs" }),
        "absolute top-1.5 right-1.5 z-10 size-7 border border-border/80 bg-background/95 text-muted-foreground shadow-sm hover:text-foreground",
        className,
      )}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
    >
      <XIcon />
    </button>
  );
}
