import { CohortsPageSkeleton } from "@/components/cohorts/cohorts-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function CohortsLoading() {
  return (
    <RouteSkeleton
      name="dashboard-cohorts"
      fallback={<CohortsPageSkeleton />}
    />
  );
}
