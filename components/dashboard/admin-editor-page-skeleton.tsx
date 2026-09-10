import { Skeleton } from "@/components/ui/skeleton";

/**
 * Fallback for CMS create/edit routes — long form + fixed save bar, not a table.
 */
export function AdminEditorPageSkeleton() {
  return (
    <div className="relative flex min-w-0 flex-1 flex-col gap-6 p-4 pb-28 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-28" />
      </div>

      <div className="flex justify-between gap-2">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="hidden h-3 w-16 sm:block" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 rounded-xl border bg-card p-4 sm:p-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-2/3" />
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 border-t bg-background/95 p-4">
        <div className="mx-auto flex max-w-6xl justify-end gap-3">
          <Skeleton className="h-11 w-full sm:w-36" />
        </div>
      </div>
    </div>
  );
}
