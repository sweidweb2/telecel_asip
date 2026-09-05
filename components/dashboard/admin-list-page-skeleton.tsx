import { Skeleton } from "@/components/ui/skeleton";

type AdminListPageSkeletonProps = {
  /** Approximate title width. */
  titleWidthClass?: string;
  /** Approximate subtitle width. */
  subtitleWidthClass?: string;
  /** Show the primary CTA skeleton in the header. */
  showHeaderAction?: boolean;
  /** Number of filter control skeletons beside search. */
  filterControlCount?: number;
  /** Column count for table row placeholders. */
  columnCount?: number;
  /** Number of table rows. */
  rowCount?: number;
};

/**
 * Shared shadcn fallback for admin CMS list pages until boneyard bones exist.
 */
export function AdminListPageSkeleton({
  titleWidthClass = "w-40",
  subtitleWidthClass = "w-72",
  showHeaderAction = true,
  filterControlCount = 1,
  columnCount = 6,
  rowCount = 8,
}: AdminListPageSkeletonProps) {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <Skeleton className={`h-8 ${titleWidthClass}`} />
          <Skeleton className={`h-4 max-w-full ${subtitleWidthClass}`} />
        </div>
        {showHeaderAction ? (
          <Skeleton className="h-11 w-full sm:h-8 sm:w-36" />
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-col gap-2 border-b p-4 lg:flex-row lg:items-center">
          <Skeleton className="h-11 min-w-0 flex-1 sm:h-8" />
          {Array.from({ length: filterControlCount }, (_, index) => (
            <Skeleton
              key={index}
              className="h-11 w-full sm:h-8 sm:w-44"
            />
          ))}
        </div>
        <div className="divide-y">
          {Array.from({ length: rowCount }, (_, index) => (
            <div
              key={index}
              className="grid gap-2 px-4 py-3"
              style={{
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: columnCount }, (_, cell) => (
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
