import { Skeleton } from "@/components/ui/skeleton";

export function InsightsPageSkeleton() {
  return (
    <main>
      <section className="border-b bg-muted/30">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-16 sm:py-20">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4 sm:h-12" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <Skeleton className="h-5 w-5/6 max-w-xl" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
        <ul className="grid grid-cols-1 gap-4 md:hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="flex flex-col gap-3 rounded-xl border p-5">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </li>
          ))}
        </ul>
        <div className="hidden space-y-4 md:block">
          <div className="flex gap-8">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-14 sm:py-20 md:gap-16">
        <Skeleton className="hidden aspect-[2/1] w-full rounded-2xl md:block md:h-[28rem] lg:h-[36rem]" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-24 shrink-0" />
          ))}
        </div>
        <ul className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index} className="flex flex-col gap-5">
              <Skeleton className="aspect-[1.5] w-full rounded-2xl" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
        <div className="flex flex-col items-center gap-4 rounded-2xl border px-6 py-10 sm:px-10 sm:py-12">
          <Skeleton className="h-8 w-64 sm:w-80" />
          <Skeleton className="h-5 w-full max-w-md" />
          <Skeleton className="h-5 w-3/4 max-w-sm" />
          <Skeleton className="mt-4 h-11 w-full sm:w-48" />
        </div>
      </section>
    </main>
  );
}
