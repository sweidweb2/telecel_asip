import { AdminEditorPageSkeleton } from "@/components/dashboard/admin-editor-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function EditEvidenceLoading() {
  return (
    <RouteSkeleton
      name="dashboard-evidence-edit"
      fallback={<AdminEditorPageSkeleton />}
    />
  );
}
