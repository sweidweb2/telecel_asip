import { AdminListPageSkeleton } from "@/components/dashboard/admin-list-page-skeleton";

/** Shadcn fallback for `/dashboard/impact-metrics` until boneyard bones are captured. */
export function ImpactMetricsPageSkeleton() {
  return (
    <AdminListPageSkeleton
      titleWidthClass="w-48"
      subtitleWidthClass="w-72"
      filterControlCount={2}
      columnCount={6}
    />
  );
}
