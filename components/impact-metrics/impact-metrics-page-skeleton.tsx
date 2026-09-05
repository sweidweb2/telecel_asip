import { Skeleton } from "@/components/ui/skeleton";

/** Shadcn fallback for `/dashboard/impact-metrics` until boneyard bones are captured. */
export function ImpactMetricsPageSkeleton() {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-11 w-full sm:h-8 sm:w-32" />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-col gap-2 border-b p-4 lg:flex-row lg:items-center">
          <Skeleton className="h-11 min-w-0 flex-1 sm:h-8" />
          <Skeleton className="h-11 w-full sm:h-8 sm:w-52" />
          <Skeleton className="h-11 w-full sm:h-8 sm:w-44" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="grid grid-cols-6 gap-2 px-4 py-3">
              {Array.from({ length: 6 }, (_, cell) => (
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

/** Shadcn fallback for `/dashboard/impact-metrics/[id]`. */
export function ImpactMetricDetailSkeleton() {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <Skeleton className="h-5 w-56" />
      <div className="grid min-w-0 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="space-y-6 rounded-xl border bg-card p-6">
            <div className="space-y-2">
              <Skeleton className="h-7 w-52" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-36 rounded-full" />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Skeleton className="size-8 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2 rounded-xl border bg-card p-6">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </main>
  );
}
