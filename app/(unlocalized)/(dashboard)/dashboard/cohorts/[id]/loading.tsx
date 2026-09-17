import { AdminEditorPageSkeleton } from "@/components/dashboard/admin-editor-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function EditCohortLoading() {
  return (
    <RouteSkeleton
      name="dashboard-cohorts-edit"
      fallback={<AdminEditorPageSkeleton />}
    />
  );
}
