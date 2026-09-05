import { AdminListPageSkeleton } from "@/components/dashboard/admin-list-page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

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

/** Shadcn fallback for `/dashboard/evidence/new` and `/dashboard/evidence/[id]`. */
export function EvidenceEditorSkeleton() {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <Skeleton className="h-5 w-56" />
      <div className="grid max-w-3xl gap-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="grid gap-5">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-11 w-full" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
        <Skeleton className="h-11 w-40" />
      </div>
    </main>
  );
}
