import { AdminListPageSkeleton } from "@/components/dashboard/admin-list-page-skeleton";

/** Shadcn fallback for `/dashboard/founder-stories` until boneyard bones are captured. */
export function FounderStoriesPageSkeleton() {
  return (
    <AdminListPageSkeleton
      titleWidthClass="w-48"
      subtitleWidthClass="w-80"
      filterControlCount={1}
      columnCount={5}
    />
  );
}
