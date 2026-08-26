import { Skeleton } from "@/components/ui/skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

function DetailFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-14 sm:px-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-12 w-2/3 max-w-xl" />
      <Skeleton className="aspect-[16/10] w-full max-w-3xl rounded-2xl" />
      <Skeleton className="h-24 w-full max-w-2xl" />
    </div>
  );
}

export default function PortfolioDetailLoading() {
  return (
    <RouteSkeleton
      name="marketing-portfolio-detail"
      fallback={<DetailFallback />}
    />
  );
}
