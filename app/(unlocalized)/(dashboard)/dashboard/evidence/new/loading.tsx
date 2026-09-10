import { AdminEditorPageSkeleton } from "@/components/dashboard/admin-editor-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function NewEvidenceLoading() {
  return (
    <RouteSkeleton
      name="dashboard-evidence-new"
      fallback={<AdminEditorPageSkeleton />}
    />
  );
}
