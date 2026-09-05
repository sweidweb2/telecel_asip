import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { EventEditorForm } from "@/components/events/event-editor-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTES } from "@/constants/routes";
import { getEventByIdForAdmin } from "@/data/events";

type EditEventPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditEventPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getEventByIdForAdmin(id);
  if (result.status !== "ok") {
    return { title: "Event | ASIP Admin" };
  }
  return { title: `${result.event.name} | ASIP Admin` };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const result = await getEventByIdForAdmin(id);

  if (result.status === "forbidden") redirect(ROUTES.dashboard);
  if (result.status === "not_found") notFound();

  const pageLabel = result.event.name.trim() || "Edit event";

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
              {pageLabel}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <EventEditorForm
        mode="edit"
        event={result.event}
        heading="Edit event"
        description="Update event details, publish status, and linked startups."
      />
    </main>
  );
}
