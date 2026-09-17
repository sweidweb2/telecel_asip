"use client";

import { Button } from "@/components/ui/button";

type AdminFormDevToolsProps = {
  onDummy: () => void;
  onClear: () => void;
  disabled?: boolean;
};

/**
 * Dev/testing controls beside the editor heading: fill sample data or wipe fields.
 * Hidden in production builds.
 */
export function AdminFormDevTools({
  onDummy,
  onClear,
  disabled,
}: AdminFormDevToolsProps) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-11 sm:min-h-8"
        disabled={disabled}
        title="Development only"
        aria-label="Fill form with dummy data (development only)"
        onClick={onDummy}
      >
        Dummy
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="min-h-11 sm:min-h-8"
        disabled={disabled}
        title="Development only"
        aria-label="Clear form fields (development only)"
        onClick={onClear}
      >
        Clear
      </Button>
    </div>
  );
}
