import { AdminEditorPageSkeleton } from "@/components/dashboard/admin-editor-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function EditImpactMetricLoading() {
  return (
    <RouteSkeleton
      name="dashboard-impact-metrics-edit"
      fallback={<AdminEditorPageSkeleton />}
    />
  );
}
