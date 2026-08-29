import { Skeleton } from "@/components/ui/skeleton";

/** Shadcn fallback for the public partners page until bones are captured. */
export function PartnersFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-14 sm:px-6">
      <div className="space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-2/3 max-w-lg" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="space-y-6">
        <Skeleton className="mx-auto h-8 w-64" />
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
