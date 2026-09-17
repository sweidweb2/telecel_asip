import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Inline status while Sharp resize/WebP/Storage runs on the Server Action.
 * Percent/cancel are not available for Server Action uploads — keep the wait honest.
 */
export function AdminImageProcessingBanner({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) {
  if (!active) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "grid gap-2 rounded-lg border border-border bg-muted/50 px-3 py-3 text-sm",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <Loader2Icon className="mt-0.5 size-4 shrink-0 animate-spin motion-reduce:animate-none" />
        <div className="min-w-0">
          <p className="font-medium text-foreground">Processing image…</p>
          <p className="text-xs text-muted-foreground text-pretty">
            Resizing and converting to WebP, then uploading. This can take a few
            seconds. Leave this page open until it finishes.
          </p>
        </div>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        aria-hidden="true"
      >
        <div className="h-full w-1/3 rounded-full bg-primary motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
