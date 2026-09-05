import type { Metadata } from "next";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { EventsTable } from "@/components/events/events-table";
import { getAdminResource } from "@/constants/admin-resources";
import {
  adminListClampParams,
  loadAdminListPage,
} from "@/lib/admin/load-admin-list-page";
import { getEventsPageData } from "@/data/events";
import { parseEventListQuery } from "@/validations/event";

const resource = getAdminResource("events");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type EventsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const query = parseEventListQuery(await searchParams);
  const { list } = await loadAdminListPage({
    query,
    fetchPage: getEventsPageData,
    listPath: resource.listPath,
    buildClampParams: (q, totalPages) =>
      adminListClampParams(totalPages, {
        search: q.search || undefined,
        status: q.status !== "all" ? q.status : undefined,
      }),
  });

  return (
    <AdminListPageShell
      title={resource.pageTitle}
      description={resource.description}
      actions={<EventFormDialog mode="create" />}
    >
      <EventsTable
        events={list.events}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </AdminListPageShell>
  );
}
