import { Skeleton } from "@/components/ui/skeleton";

/** Shadcn fallback for `/dashboard/founder-stories` until boneyard bones are captured. */
export function FounderStoriesPageSkeleton() {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-11 w-full sm:h-8 sm:w-40" />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-col gap-2 border-b p-4 lg:flex-row lg:items-center">
          <Skeleton className="h-11 min-w-0 flex-1 sm:h-8" />
          <Skeleton className="h-11 w-full sm:h-8 sm:w-36" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 px-4 py-3">
              {Array.from({ length: 5 }, (_, cell) => (
                <Skeleton key={cell} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>
    </main>
  );
}

/** Shadcn fallback for `/dashboard/founder-stories/new` and `/[id]`. */
export function FounderStoryEditorSkeleton() {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <Skeleton className="h-5 w-56" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="space-y-6 rounded-xl border bg-card p-4 sm:p-6">
        <Skeleton className="h-11 w-full" />
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-11 w-40" />
      </div>
    </main>
  );
}
