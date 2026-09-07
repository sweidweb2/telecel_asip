import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import { PartnerDetailSkeleton } from "@/components/partners/partners-page-skeleton";

export default function PartnerDetailLoading() {
  return (
    <RouteSkeleton
      name="dashboard-partner-detail"
      fallback={<PartnerDetailSkeleton />}
    />
  );
}
