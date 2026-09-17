import { AdminEditorPageSkeleton } from "@/components/dashboard/admin-editor-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function NewImpactMetricLoading() {
  return (
    <RouteSkeleton
      name="dashboard-impact-metrics-new"
      fallback={<AdminEditorPageSkeleton />}
    />
  );
}
