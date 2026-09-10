import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminAnalyticsDashboard } from "@/components/dashboard/admin-analytics-dashboard";
import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { ROUTES } from "@/constants/routes";
import { getAdminAnalytics } from "@/data/admin-analytics";

export const metadata: Metadata = {
  title: "Analytics | ASIP Editor",
};

export default async function AnalyticsPage() {
  const result = await getAdminAnalytics();
  if (result.status === "forbidden") redirect(ROUTES.dashboard);

  return (
    <AdminListPageShell
      title="Analytics"
    >
      <AdminAnalyticsDashboard analytics={result.analytics} />
    </AdminListPageShell>
  );
}
