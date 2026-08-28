import { Skeleton } from "@/components/ui/skeleton";

export function StartupsPageSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-11 flex-1 rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg sm:w-44" />
        <Skeleton className="h-11 w-full rounded-lg sm:w-28" />
        <Skeleton className="h-11 w-full rounded-lg sm:w-36" />
      </div>
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="aspect-[1.5] w-full rounded-2xl" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StartupEditorSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
