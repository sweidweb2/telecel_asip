"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export type EditorRecordLoadResult<T> =
  | { status: "ok"; record: T }
  | { status: "forbidden" }
  | { status: "not_found" };

/**
 * Load a full editor row when a shared dialog opens.
 * Keeps essay-length fields off the list payload (fetch on demand).
 */
export function useEditorRecord<T>({
  open,
  id,
  load,
  missingMessage = "Record not found.",
}: {
  open: boolean;
  id: string | undefined;
  load: (id: string) => Promise<EditorRecordLoadResult<T>>;
  missingMessage?: string;
}) {
  const [record, setRecord] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || !id) {
      setRecord(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setRecord(null);

    void load(id)
      .then((result) => {
        if (cancelled) return;
        if (result.status === "ok") {
          setRecord(result.record);
          return;
        }
        toast.error(
          result.status === "forbidden"
            ? "You do not have permission to view this."
            : missingMessage,
        );
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Could not load details. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, id, load, missingMessage]);

  return { record, isLoading };
}
