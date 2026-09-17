import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import { StaffPageSkeleton } from "@/components/dashboard/page-skeleton";

export default function PerformanceLoading() {
  return (
    <RouteSkeleton
      name="admin-performance"
      fallback={<StaffPageSkeleton />}
    />
  );
}
