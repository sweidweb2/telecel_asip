import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { EventFormDialog } from "@/components/events/event-form-dialog";
import { EventsTable } from "@/components/events/events-table";
import { ROUTES } from "@/constants/routes";
import {
  getEventsPageData,
  getEventStartupOptions,
} from "@/data/events";
import { parseEventListQuery } from "@/validations/event";

export const metadata: Metadata = {
  title: "Events | ASIP Admin",
};

type EventsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const query = parseEventListQuery(await searchParams);
  const [pageResult, optionsResult] = await Promise.all([
    getEventsPageData(query),
    getEventStartupOptions(),
  ]);

  if (pageResult.status === "forbidden" || optionsResult.status === "forbidden") {
    redirect(ROUTES.dashboard);
  }

  const { list } = pageResult;
  const { options: startupOptions } = optionsResult;

  if (query.page > list.totalPages) {
    const params = new URLSearchParams({ page: String(list.totalPages) });
    if (query.search) params.set("search", query.search);
    if (query.status !== "all") params.set("status", query.status);
    redirect(`${ROUTES.events}?${params.toString()}`);
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Events
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Programme events, speakers, assets, and linked startups.
          </p>
        </div>
        <EventFormDialog mode="create" startupOptions={startupOptions} />
      </div>

      <EventsTable
        events={list.events}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
        startupOptions={startupOptions}
      />
    </main>
  );
}
