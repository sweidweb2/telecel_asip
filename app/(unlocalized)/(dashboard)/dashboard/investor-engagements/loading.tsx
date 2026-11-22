import { InvestorEngagementsPageSkeleton } from "@/components/investor-engagements/investor-engagements-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function InvestorEngagementsLoading() {
  return (
    <RouteSkeleton
      name="dashboard-investor-engagements"
      fallback={<InvestorEngagementsPageSkeleton />}
    />
  );
}
