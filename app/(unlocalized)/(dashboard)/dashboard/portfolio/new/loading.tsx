import { AdminEditorPageSkeleton } from "@/components/dashboard/admin-editor-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function NewStartupLoading() {
  return (
    <RouteSkeleton
      name="dashboard-portfolio-new"
      fallback={<AdminEditorPageSkeleton />}
    />
  );
}
