import { Skeleton } from "@/components/ui/skeleton";

export default function MarketingLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16">
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-9 w-32" />
      </div>
    </main>
  );
}
