import { Skeleton } from "@/components/ui/skeleton";

/** Shadcn fallback for the public partners page until bones are captured. */
export function PartnersFallback() {
  return (
    <div className="w-full">
      <div className="relative min-h-[22rem] bg-asip-ink-night px-4 py-16 sm:min-h-[26rem] sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl space-y-4">
          <Skeleton className="h-3 w-36 bg-white/15" />
          <Skeleton className="h-10 w-full max-w-xl bg-white/20" />
          <Skeleton className="h-5 w-full max-w-lg bg-white/10" />
          <Skeleton className="mt-4 h-11 w-48 rounded-full bg-white/20" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
          </div>
          <Skeleton className="h-56 w-full rounded-sm lg:col-span-7" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="mx-auto h-8 w-64" />
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
