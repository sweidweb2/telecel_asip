import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import { MarketingPageFallback } from "@/components/marketing/marketing-page-fallback";

export default function MarketingLoading() {
  return (
    <RouteSkeleton name="marketing-en" fallback={<MarketingPageFallback />} />
  );
}
