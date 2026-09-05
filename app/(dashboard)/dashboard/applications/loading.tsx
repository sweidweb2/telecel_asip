import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import { ApplicationsPageSkeleton } from "@/components/applications/applications-page-skeleton";

export default function ApplicationsLoading() {
  return (
    <RouteSkeleton
      name="dashboard-applications"
      fallback={<ApplicationsPageSkeleton />}
    />
  );
}
