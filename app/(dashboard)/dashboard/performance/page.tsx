import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { AdminPerfDashboard } from "@/components/dashboard/admin-perf-dashboard";
import { ROUTES } from "@/constants/routes";
import {
  getAdminPerfEventsByRequestIds,
  getAdminPerfEventsPageData,
} from "@/data/admin-perf-events";
import { setAdminPerfRoute } from "@/lib/admin/perf";

export const metadata: Metadata = {
  title: "Performance | ASIP Admin",
};

export default async function PerformancePage() {
  // Exclude this route from nested instrumentation for the rest of the request.
  setAdminPerfRoute(ROUTES.performance);

  const result = await getAdminPerfEventsPageData({ sinceHours: 24, limit: 200 });
  if (result.status === "forbidden") redirect(ROUTES.dashboard);

  const requestIds = [...new Set(result.events.map((e) => e.request_id))];
  const siblingResult = await getAdminPerfEventsByRequestIds(requestIds);
  const siblingsByRequestId =
    siblingResult.status === "ok" ? siblingResult.byRequestId : {};

  return (
    <AdminListPageShell
      title="Performance"
      description="Temporary CMS timing debug. Cache hits show React.cache / request dedupe; misses and n_a are real work. Disable with ADMIN_PERF_TRACKING unset."
    >
      <AdminPerfDashboard
        events={result.events}
        analytics={result.analytics}
        trackingEnabled={result.trackingEnabled}
        siblingsByRequestId={siblingsByRequestId}
      />
    </AdminListPageShell>
  );
}
