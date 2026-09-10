import { AdminEditorPageSkeleton } from "@/components/dashboard/admin-editor-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function EditFounderStoryLoading() {
  return (
    <RouteSkeleton
      name="dashboard-founder-stories-edit"
      fallback={<AdminEditorPageSkeleton />}
    />
  );
}
