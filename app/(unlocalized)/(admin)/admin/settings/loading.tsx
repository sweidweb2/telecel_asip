import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import { StaffPageSkeleton } from "@/components/dashboard/page-skeleton";

export default function AdminSettingsLoading() {
  return (
    <RouteSkeleton
      name="admin-settings"
      fallback={<StaffPageSkeleton />}
    />
  );
}
