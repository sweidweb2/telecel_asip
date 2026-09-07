import { AdminListPageSkeleton } from "@/components/dashboard/admin-list-page-skeleton";

/** Shadcn fallback for `/dashboard/events` until boneyard bones are captured. */
export function EventsPageSkeleton() {
  return (
    <AdminListPageSkeleton
      titleWidthClass="w-32"
      subtitleWidthClass="w-72"
      filterControlCount={1}
      columnCount={6}
    />
  );
}
