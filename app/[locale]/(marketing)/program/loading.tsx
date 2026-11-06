import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import { MarketingPageFallback } from "@/components/marketing/marketing-page-fallback";

export default function Loading() {
  return (
    <RouteSkeleton name="marketing" fallback={<MarketingPageFallback />} />
  );
}
