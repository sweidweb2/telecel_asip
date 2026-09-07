import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import { PartnersPageSkeleton } from "@/components/partners/partners-page-skeleton";

export default function PartnersLoading() {
  return (
    <RouteSkeleton
      name="dashboard-partners"
      fallback={<PartnersPageSkeleton />}
    />
  );
}
