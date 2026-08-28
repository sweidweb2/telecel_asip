import { Skeleton } from "@/components/ui/skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

function FoundersFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-14 sm:px-6">
      <Skeleton className="h-10 w-2/3 max-w-lg" />
      <Skeleton className="h-5 w-full max-w-xl" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[16/10] w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function FoundersLoading() {
  return (
    <RouteSkeleton name="marketing-founders" fallback={<FoundersFallback />} />
  );
}
