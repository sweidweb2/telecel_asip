import { Skeleton } from "@/components/ui/skeleton";

export function CohortsPageSkeleton() {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 w-full sm:w-44" />
        <Skeleton className="h-11 w-full sm:w-28" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </main>
  );
}
