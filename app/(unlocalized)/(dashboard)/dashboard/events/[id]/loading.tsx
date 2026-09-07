import { EventsPageSkeleton } from "@/components/events/events-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function EditEventLoading() {
  return (
    <RouteSkeleton
      name="dashboard-events-edit"
      fallback={<EventsPageSkeleton />}
    />
  );
}
