import { ImpactMetricEditorSkeleton } from "@/components/impact-metrics/impact-metrics-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function EditImpactMetricLoading() {
  return (
    <RouteSkeleton
      name="dashboard-impact-metrics-edit"
      fallback={<ImpactMetricEditorSkeleton />}
    />
  );
}
