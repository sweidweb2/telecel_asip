import { PartnersPageSkeleton } from "@/components/partners/partners-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function NewPartnerLoading() {
  return (
    <RouteSkeleton
      name="dashboard-partners-new"
      fallback={<PartnersPageSkeleton />}
    />
  );
}
