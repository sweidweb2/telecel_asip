import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import { StartupsPageSkeleton } from "@/components/startups/startups-page-skeleton";

export default function PortfolioLoading() {
  return (
    <RouteSkeleton
      name="dashboard-portfolio"
      fallback={<StartupsPageSkeleton />}
    />
  );
}
