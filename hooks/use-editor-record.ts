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
 *
 * Exposes a record only when it matches the current `id` so consumers
 * (e.g. mark-reviewed) never act on a stale previous row.
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
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const shouldLoad = open && Boolean(id);

  useEffect(() => {
    if (!shouldLoad || !id) return;

    let cancelled = false;
    const requestId = id;

    void (async () => {
      // Async boundary keeps React Compiler happy (no sync setState in effect).
      await Promise.resolve();
      if (cancelled) return;
      setIsLoading(true);
      setRecord(null);
      setLoadedId(null);

      try {
        const result = await load(requestId);
        if (cancelled) return;
        if (result.status === "ok") {
          setRecord(result.record);
          setLoadedId(requestId);
          return;
        }
        toast.error(
          result.status === "forbidden"
            ? "You do not have permission to view this."
            : missingMessage,
        );
      } catch {
        if (cancelled) return;
        toast.error("Could not load details. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shouldLoad, id, load, missingMessage]);

  const recordForCurrentId =
    shouldLoad && id && loadedId === id ? record : null;

  return {
    record: recordForCurrentId,
    isLoading: shouldLoad ? isLoading || loadedId !== id : false,
  };
}
