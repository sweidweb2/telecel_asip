import { AdminListPageSkeleton } from "@/components/dashboard/admin-list-page-skeleton";

export function CohortsPageSkeleton() {
  return (
    <AdminListPageSkeleton
      titleWidthClass="w-48"
      subtitleWidthClass="w-80"
      showHeaderAction={false}
      filterControlCount={2}
      columnCount={5}
    />
  );
}
