import { AdminListPageSkeleton } from "@/components/dashboard/admin-list-page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/** Shadcn fallback for `/dashboard/events` until boneyard bones are captured. */
export function EventsPageSkeleton() {
  return (
    <AdminListPageSkeleton
      titleWidthClass="w-32"
      subtitleWidthClass="w-72"
      filterControlCount={1}
      columnCount={6}
    />
  );
}

/** Shadcn fallback for `/dashboard/events/[id]`. */
export function EventDetailSkeleton() {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <Skeleton className="h-5 w-56" />
      <div className="grid min-w-0 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="space-y-6 rounded-xl border bg-card p-6">
            <Skeleton className="h-7 w-52" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
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
        <div className="flex flex-col gap-6">
          <div className="space-y-3 rounded-xl border bg-card p-6">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="space-y-2 rounded-xl border bg-card p-6">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
