import { ImpactMetricEditorSkeleton } from "@/components/impact-metrics/impact-metrics-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function NewImpactMetricLoading() {
  return (
    <RouteSkeleton
      name="dashboard-impact-metrics-new"
      fallback={<ImpactMetricEditorSkeleton />}
    />
  );
}
