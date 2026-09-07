import { AdminListPageSkeleton } from "@/components/dashboard/admin-list-page-skeleton";

export function CohortsPageSkeleton() {
  return (
    <AdminListPageSkeleton
      titleWidthClass="w-48"
      subtitleWidthClass="w-80"
      showHeaderAction
      filterControlCount={1}
      columnCount={5}
    />
  );
}
