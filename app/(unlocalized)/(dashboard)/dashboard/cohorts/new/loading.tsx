import { CohortsPageSkeleton } from "@/components/cohorts/cohorts-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function NewCohortLoading() {
  return (
    <RouteSkeleton
      name="dashboard-cohorts-new"
      fallback={<CohortsPageSkeleton />}
    />
  );
}
