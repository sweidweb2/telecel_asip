import { AdminEditorPageSkeleton } from "@/components/dashboard/admin-editor-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function NewFounderStoryLoading() {
  return (
    <RouteSkeleton
      name="dashboard-founder-stories-new"
      fallback={<AdminEditorPageSkeleton />}
    />
  );
}
