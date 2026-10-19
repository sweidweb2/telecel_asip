import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import { StaffPageSkeleton } from "@/components/dashboard/page-skeleton";

export default function AdminCatalogLoading() {
  return (
    <RouteSkeleton name="admin-catalog" fallback={<StaffPageSkeleton />} />
  );
}
