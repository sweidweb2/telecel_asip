import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import { StartupEditorSkeleton } from "@/components/startups/startups-page-skeleton";

export default function EditStartupLoading() {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <RouteSkeleton
        name="dashboard-portfolio-edit"
        fallback={<StartupEditorSkeleton />}
      />
    </main>
  );
}
