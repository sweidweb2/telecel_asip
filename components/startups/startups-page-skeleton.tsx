import { AdminListPageSkeleton } from "@/components/dashboard/admin-list-page-skeleton";

export function StartupsPageSkeleton() {
  return (
    <AdminListPageSkeleton
      titleWidthClass="w-40"
      subtitleWidthClass="w-80"
      showHeaderAction
      filterControlCount={1}
      columnCount={5}
    />
  );
}
