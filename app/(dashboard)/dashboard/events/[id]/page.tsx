import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { EventDetailContent } from "@/components/events/event-detail-content";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTES } from "@/constants/routes";
import {
  getEventByIdForAdmin,
  getEventStartupOptions,
} from "@/data/events";

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getEventByIdForAdmin(id);
  if (result.status !== "ok") {
    return { title: "Event | ASIP Admin" };
  }
  return { title: `${result.event.name} | ASIP Admin` };
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;
  const [result, optionsResult] = await Promise.all([
    getEventByIdForAdmin(id),
    getEventStartupOptions(),
  ]);

  if (result.status === "forbidden" || optionsResult.status === "forbidden") {
    redirect(ROUTES.dashboard);
  }
  if (result.status === "not_found") notFound();

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={ROUTES.events} />}>
              Events
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[16rem] truncate sm:max-w-md">
              {result.event.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <EventDetailContent
        event={result.event}
        startupOptions={optionsResult.options}
      />
    </main>
  );
}
