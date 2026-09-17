import { AdminEditorPageSkeleton } from "@/components/dashboard/admin-editor-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function EditEventLoading() {
  return (
    <RouteSkeleton
      name="dashboard-events-edit"
      fallback={<AdminEditorPageSkeleton />}
    />
  );
}
