import { AdminListPageSkeleton } from "@/components/dashboard/admin-list-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function EventsLoading() {
  return (
    <RouteSkeleton
      name="dashboard-events"
      fallback={
        <AdminListPageSkeleton filterControlCount={1} columnCount={6} />
      }
    />
  );
}
