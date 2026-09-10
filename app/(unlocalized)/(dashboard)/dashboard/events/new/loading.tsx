import { AdminEditorPageSkeleton } from "@/components/dashboard/admin-editor-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function NewEventLoading() {
  return (
    <RouteSkeleton
      name="dashboard-events-new"
      fallback={<AdminEditorPageSkeleton />}
    />
  );
}
