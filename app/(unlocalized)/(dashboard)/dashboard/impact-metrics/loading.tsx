import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import { ImpactMetricsPageSkeleton } from "@/components/impact-metrics/impact-metrics-page-skeleton";

export default function ImpactMetricsLoading() {
  return (
    <RouteSkeleton
      name="dashboard-impact-metrics"
      fallback={<ImpactMetricsPageSkeleton />}
    />
  );
}
