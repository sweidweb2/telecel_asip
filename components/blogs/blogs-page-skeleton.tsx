import { AdminListPageSkeleton } from "@/components/dashboard/admin-list-page-skeleton";

export function BlogsPageSkeleton() {
  return (
    <AdminListPageSkeleton
      titleWidthClass="w-32"
      subtitleWidthClass="w-80"
      showHeaderAction
      filterControlCount={1}
      columnCount={5}
    />
  );
}
