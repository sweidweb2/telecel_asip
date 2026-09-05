import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import { EventDetailSkeleton } from "@/components/events/events-page-skeleton";

export default function EventDetailLoading() {
  return (
    <RouteSkeleton
      name="dashboard-events-detail"
      fallback={<EventDetailSkeleton />}
    />
  );
}
