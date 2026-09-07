import { FounderStoryEditorSkeleton } from "@/components/founder-stories/founder-stories-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function EditFounderStoryLoading() {
  return (
    <RouteSkeleton
      name="dashboard-founder-stories-edit"
      fallback={<FounderStoryEditorSkeleton />}
    />
  );
}
