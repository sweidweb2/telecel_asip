import { AdminListPageSkeleton } from "@/components/dashboard/admin-list-page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

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

/** Shadcn fallback for `/dashboard/founder-stories/new` and `/[id]`. */
export function FounderStoryEditorSkeleton() {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <Skeleton className="h-5 w-56" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="space-y-6 rounded-xl border bg-card p-4 sm:p-6">
        <Skeleton className="h-11 w-full" />
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-11 w-40" />
      </div>
    </main>
  );
}
