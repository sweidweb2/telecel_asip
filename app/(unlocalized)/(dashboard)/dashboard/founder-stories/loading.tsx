import { FounderStoriesPageSkeleton } from "@/components/founder-stories/founder-stories-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function FounderStoriesLoading() {
  return (
    <RouteSkeleton
      name="dashboard-founder-stories"
      fallback={<FounderStoriesPageSkeleton />}
    />
  );
}
