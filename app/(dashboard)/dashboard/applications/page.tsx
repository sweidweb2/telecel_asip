import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ApplicationsTable } from "@/components/applications/applications-table";
import { ROUTES } from "@/constants/routes";
import { getApplicationsPageData } from "@/data/applications";
import { parseApplicationListQuery } from "@/validations/application";

export const metadata: Metadata = {
  title: "Applications | ASIP Admin",
};

type ApplicationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const query = parseApplicationListQuery(await searchParams);
  const result = await getApplicationsPageData(query);

  if (result.status === "forbidden") redirect(ROUTES.dashboard);

  const { list } = result;

  if (query.page > list.totalPages) {
    const params = new URLSearchParams({ page: String(list.totalPages) });
    if (query.search) params.set("search", query.search);
    redirect(`${ROUTES.applications}?${params.toString()}`);
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="min-w-0">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Applications
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Official Apply submissions. Separate from Register Interest leads —
          there is no automatic conversion.
        </p>
      </div>

      <ApplicationsTable
        applications={list.applications}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </main>
  );
}
