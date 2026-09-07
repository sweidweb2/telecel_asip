import { PartnersFallback } from "@/components/marketing/partners-fallback";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function PartnersLoading() {
  return (
    <RouteSkeleton name="marketing-partners" fallback={<PartnersFallback />} />
  );
}
