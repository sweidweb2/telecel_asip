import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import { ImpactMetricDetailSkeleton } from "@/components/impact-metrics/impact-metrics-page-skeleton";

export default function ImpactMetricDetailLoading() {
  return (
    <RouteSkeleton
      name="dashboard-impact-metric-detail"
      fallback={<ImpactMetricDetailSkeleton />}
    />
  );
}
