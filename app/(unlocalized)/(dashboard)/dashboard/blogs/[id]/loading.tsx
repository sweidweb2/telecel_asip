import { AdminEditorPageSkeleton } from "@/components/dashboard/admin-editor-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function EditBlogLoading() {
  return (
    <RouteSkeleton
      name="dashboard-blogs-edit"
      fallback={<AdminEditorPageSkeleton />}
    />
  );
}
