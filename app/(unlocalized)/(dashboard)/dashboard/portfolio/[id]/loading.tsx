import { AdminEditorPageSkeleton } from "@/components/dashboard/admin-editor-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function EditStartupLoading() {
  return (
    <RouteSkeleton
      name="dashboard-portfolio-edit"
      fallback={<AdminEditorPageSkeleton />}
    />
  );
}
