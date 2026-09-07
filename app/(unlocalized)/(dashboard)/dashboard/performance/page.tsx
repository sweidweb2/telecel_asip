import type { Metadata } from "next";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { AdminPerfDashboard } from "@/components/dashboard/admin-perf-dashboard";
import { DeleteOldPerfEventsButton } from "@/components/dashboard/delete-old-perf-events-button";
import { ROUTES } from "@/constants/routes";
import {
  getAdminPerfEventsByRequestIds,
  getAdminPerfEventsPageData,
} from "@/data/admin-perf-events";
import {
  adminListClampParams,
  loadAdminListPage,
} from "@/lib/admin/load-admin-list-page";
import { setAdminPerfRoute } from "@/lib/admin/perf";
import {
  adminPerfListFilterParams,
  parseAdminPerfListQuery,
} from "@/validations/admin-perf-events";

export const metadata: Metadata = {
  title: "Performance | ASIP Admin",
};

type PerformancePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PerformancePage({
  searchParams,
}: PerformancePageProps) {
  // Exclude this route from nested instrumentation for the rest of the request.
  setAdminPerfRoute(ROUTES.performance);

  const query = parseAdminPerfListQuery(await searchParams);
  const result = await loadAdminListPage({
    query,
    fetchPage: getAdminPerfEventsPageData,
    listPath: ROUTES.performance,
    buildClampParams: (q, totalPages) =>
      adminListClampParams(totalPages, adminPerfListFilterParams(q)),
  });

  const requestIds = [...new Set(result.list.events.map((e) => e.request_id))];
  const siblingResult = await getAdminPerfEventsByRequestIds(requestIds);
  const siblingsByRequestId =
    siblingResult.status === "ok" ? siblingResult.byRequestId : {};

  return (
    <AdminListPageShell
      title="Performance"
      actions={<DeleteOldPerfEventsButton />}
    >
      <AdminPerfDashboard
        events={result.list.events}
        total={result.list.total}
        totalPages={result.list.totalPages}
        query={query}
        analytics={result.analytics}
        trackingEnabled={result.trackingEnabled}
        siblingsByRequestId={siblingsByRequestId}
      />
    </AdminListPageShell>
  );
}
