import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import { StaffPageSkeleton } from "@/components/dashboard/page-skeleton";

export default function BackupLoading() {
  return (
    <RouteSkeleton
      name="admin-backup"
      fallback={<StaffPageSkeleton />}
    />
  );
}
