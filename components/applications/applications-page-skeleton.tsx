import { Skeleton } from "@/components/ui/skeleton";

export function ApplicationsPageSkeleton() {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="min-w-0 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b p-4">
          <Skeleton className="h-11 w-full sm:h-8" />
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
      </div>
    </main>
  );
}
