import { AdminListPageSkeleton } from "@/components/dashboard/admin-list-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function EvidenceLoading() {
  return (
    <RouteSkeleton
      name="dashboard-evidence"
      fallback={
        <AdminListPageSkeleton filterControlCount={2} columnCount={6} />
      }
    />
  );
}
