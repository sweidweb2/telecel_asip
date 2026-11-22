import { InvestorInterestsPageSkeleton } from "@/components/investor-interests/investor-interests-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function InvestorInterestsLoading() {
  return (
    <RouteSkeleton
      name="dashboard-investor-interests"
      fallback={<InvestorInterestsPageSkeleton />}
    />
  );
}
