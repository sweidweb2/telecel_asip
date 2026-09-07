import { AdminListPageSkeleton } from "@/components/dashboard/admin-list-page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

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

export function StartupEditorSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
