import { EvidenceEditorSkeleton } from "@/components/evidence-records/evidence-records-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function EditEvidenceLoading() {
  return (
    <RouteSkeleton
      name="dashboard-evidence-edit"
      fallback={<EvidenceEditorSkeleton />}
    />
  );
}
