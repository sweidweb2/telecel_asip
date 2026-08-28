import { Skeleton } from "@/components/ui/skeleton";

/**
 * Generic hero-shaped placeholder for marketing routes, used as the
 * `RouteSkeleton` fallback until bones are captured.
 */
export function MarketingPageFallback() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
      <div className="max-w-2xl space-y-4 sm:space-y-6">
        <Skeleton className="h-9 w-2/3 sm:h-10" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-11 w-full sm:h-9 sm:w-32" />
      </div>
    </main>
  );
}
