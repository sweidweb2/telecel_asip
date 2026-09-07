import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import { EventsPageSkeleton } from "@/components/events/events-page-skeleton";

export default function EventsLoading() {
  return (
    <RouteSkeleton
      name="dashboard-events"
      fallback={<EventsPageSkeleton />}
    />
  );
}
