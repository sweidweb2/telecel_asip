import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import { StaffPageSkeleton } from "@/components/dashboard/page-skeleton";

export default function AdminOverviewLoading() {
  return (
    <RouteSkeleton
      name="admin-overview"
      fallback={<StaffPageSkeleton />}
    />
  );
}
