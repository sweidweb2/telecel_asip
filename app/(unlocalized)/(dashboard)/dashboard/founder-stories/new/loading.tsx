import { FounderStoryEditorSkeleton } from "@/components/founder-stories/founder-stories-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function NewFounderStoryLoading() {
  return (
    <RouteSkeleton
      name="dashboard-founder-stories-new"
      fallback={<FounderStoryEditorSkeleton />}
    />
  );
}
