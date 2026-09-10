import { AdminEditorPageSkeleton } from "@/components/dashboard/admin-editor-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function NewCohortLoading() {
  return (
    <RouteSkeleton
      name="dashboard-cohorts-new"
      fallback={<AdminEditorPageSkeleton />}
    />
  );
}
