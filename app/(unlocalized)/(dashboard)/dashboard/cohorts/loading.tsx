import { AdminListPageSkeleton } from "@/components/dashboard/admin-list-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function CohortsLoading() {
  return (
    <RouteSkeleton
      name="dashboard-cohorts"
      fallback={
        <AdminListPageSkeleton filterControlCount={1} columnCount={5} />
      }
    />
  );
}
