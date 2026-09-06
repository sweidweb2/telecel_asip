"use client";

import { Button } from "@/components/ui/button";

type AdminFormDevToolsProps = {
  onDummy: () => void;
  onClear: () => void;
  disabled?: boolean;
};

/**
 * Dev/testing controls beside the editor heading: fill sample data or wipe fields.
 */
export function AdminFormDevTools({
  onDummy,
  onClear,
  disabled,
}: AdminFormDevToolsProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-11 sm:min-h-8"
        disabled={disabled}
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
        onClick={onClear}
      >
        Clear
      </Button>
    </div>
  );
}
