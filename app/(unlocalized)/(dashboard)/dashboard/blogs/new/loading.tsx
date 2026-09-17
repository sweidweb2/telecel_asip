import { AdminEditorPageSkeleton } from "@/components/dashboard/admin-editor-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function NewBlogLoading() {
  return (
    <RouteSkeleton
      name="dashboard-blogs-new"
      fallback={<AdminEditorPageSkeleton />}
    />
  );
}
