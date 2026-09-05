import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { EventsTable } from "@/components/events/events-table";
import { Button } from "@/components/ui/button";
import { getAdminResource } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
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
      actions={
        <Button
          className="min-h-11 w-full sm:w-auto"
          nativeButton={false}
          render={<Link href={ROUTES.eventsNew} />}
        >
          <PlusIcon className="size-4" />
          New event
        </Button>
      }
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
