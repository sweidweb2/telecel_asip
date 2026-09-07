import { Skeleton } from "@/components/ui/skeleton";

/**
 * Soft-nav feedback while the dashboard layout (auth + chrome) and page resolve.
 */
export default function DashboardSegmentLoading() {
  return (
    <div className="flex min-h-svh w-full">
      <div className="hidden w-[--sidebar-width] shrink-0 border-r bg-sidebar md:block md:w-64">
        <div className="flex flex-col gap-3 p-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-24" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} className="h-9 w-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center gap-3 border-b px-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="ml-auto size-8 rounded-full" />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
