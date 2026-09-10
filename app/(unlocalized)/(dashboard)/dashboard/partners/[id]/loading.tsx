import { AdminEditorPageSkeleton } from "@/components/dashboard/admin-editor-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function PartnerDetailLoading() {
  return (
    <RouteSkeleton
      name="dashboard-partner-detail"
      fallback={<AdminEditorPageSkeleton />}
    />
  );
}
