import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import { EvidenceDetailSkeleton } from "@/components/evidence-records/evidence-records-page-skeleton";

export default function EvidenceDetailLoading() {
  return (
    <RouteSkeleton
      name="dashboard-evidence-detail"
      fallback={<EvidenceDetailSkeleton />}
    />
  );
}
