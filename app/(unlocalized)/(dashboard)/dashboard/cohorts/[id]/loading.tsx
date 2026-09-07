import { CohortsPageSkeleton } from "@/components/cohorts/cohorts-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function EditCohortLoading() {
  return (
    <RouteSkeleton
      name="dashboard-cohorts-edit"
      fallback={<CohortsPageSkeleton />}
    />
  );
}
