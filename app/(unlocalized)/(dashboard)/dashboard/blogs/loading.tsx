import { AdminListPageSkeleton } from "@/components/dashboard/admin-list-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function BlogsLoading() {
  return (
    <RouteSkeleton
      name="dashboard-blogs"
      fallback={
        <AdminListPageSkeleton filterControlCount={1} columnCount={5} />
      }
    />
  );
}
