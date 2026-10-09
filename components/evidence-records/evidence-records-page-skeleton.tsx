import { AdminListPageSkeleton } from "@/components/dashboard/admin-list-page-skeleton";

/** Shadcn fallback for `/dashboard/evidence` until boneyard bones are captured. */
export function EvidenceRecordsPageSkeleton() {
  return (
    <AdminListPageSkeleton
      titleWidthClass="w-40"
      subtitleWidthClass="w-72"
      filterControlCount={2}
      columnCount={6}
    />
  );
}
