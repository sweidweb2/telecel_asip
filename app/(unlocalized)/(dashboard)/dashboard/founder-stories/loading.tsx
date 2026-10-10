import { AdminListPageSkeleton } from "@/components/dashboard/admin-list-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function FounderStoriesLoading() {
  return (
    <RouteSkeleton
      name="dashboard-founder-stories"
      fallback={
        <AdminListPageSkeleton filterControlCount={1} columnCount={5} />
      }
    />
  );
}
