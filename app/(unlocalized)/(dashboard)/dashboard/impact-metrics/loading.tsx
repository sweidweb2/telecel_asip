import { AdminListPageSkeleton } from "@/components/dashboard/admin-list-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function ImpactMetricsLoading() {
  return (
    <RouteSkeleton
      name="dashboard-impact-metrics"
      fallback={
        <AdminListPageSkeleton filterControlCount={2} columnCount={6} />
      }
    />
  );
}
