import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-16">
      <div className="max-w-xl space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </main>
  );
}
