import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import { EvidenceRecordsPageSkeleton } from "@/components/evidence-records/evidence-records-page-skeleton";

export default function EvidenceLoading() {
  return (
    <RouteSkeleton
      name="dashboard-evidence"
      fallback={<EvidenceRecordsPageSkeleton />}
    />
  );
}
