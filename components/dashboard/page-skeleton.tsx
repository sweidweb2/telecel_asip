import { Skeleton } from "@/components/ui/skeleton";

/**
 * Generic staff content skeleton — title lives in the sticky StaffHeader, so
 * this only mirrors the page body (actions + content blob).
 */
export function StaffPageSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="flex justify-end">
        <Skeleton className="h-11 w-full sm:h-8 sm:w-36" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
