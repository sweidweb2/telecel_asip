import { NewsletterSubscribersPageSkeleton } from "@/components/newsletter/newsletter-subscribers-page-skeleton";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";

export default function NewsletterLoading() {
  return (
    <RouteSkeleton
      name="dashboard-newsletter"
      fallback={<NewsletterSubscribersPageSkeleton />}
    />
  );
}
