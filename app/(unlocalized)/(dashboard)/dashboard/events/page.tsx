import type { Metadata } from "next";

import { CmsListPage } from "@/components/dashboard/cms-list-page";
import { EventStatsCards } from "@/components/dashboard/cms-list-stats";
import { EventsTable } from "@/components/events/events-table";
import { getAdminResource } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
import { getEventsPageData } from "@/data/events";
import { parseEventListQuery } from "@/validations/event";

const resource = getAdminResource("events");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type EventsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function EventsPage({ searchParams }: EventsPageProps) {
  return (
    <CmsListPage
      resourceId="events"
      searchParams={searchParams}
      parseQuery={parseEventListQuery}
      fetchPage={getEventsPageData}
      activeFilters={(query) => ({
        search: query.search || undefined,
        status: query.status !== "all" ? query.status : undefined,
      })}
      newItem={{ href: ROUTES.eventsNew, label: "New event" }}
      stats={(result) => <EventStatsCards stats={result.stats} />}
    >
      {({ query, result }) => (
        <EventsTable
          events={result.list.events}
          total={result.list.total}
          totalPages={result.list.totalPages}
          query={query}
        />
      )}
    </CmsListPage>
  );
}
