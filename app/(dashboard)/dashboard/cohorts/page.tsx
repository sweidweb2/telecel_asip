import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CohortsAdminList } from "@/components/cohorts/cohorts-admin-list";
import { ROUTES } from "@/constants/routes";
import { getCohortsPageData } from "@/data/cohorts";
import { parseCohortListQuery } from "@/validations/cohort";

export const metadata: Metadata = {
  title: "Cohorts | ASIP Admin",
};

type CohortsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CohortsPage({ searchParams }: CohortsPageProps) {
  const query = parseCohortListQuery(await searchParams);
  const result = await getCohortsPageData(query);

  if (result.status === "forbidden") redirect(ROUTES.dashboard);

  const { list } = result;

  if (query.page > list.totalPages) {
    const params = new URLSearchParams({
      page: String(list.totalPages),
    });
    if (query.search) params.set("search", query.search);
    if (query.status !== "all") params.set("status", query.status);
    redirect(`${ROUTES.cohorts}?${params.toString()}`);
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="min-w-0">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Cohorts
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage programme years, publish status, and linked partners and
          founders.
        </p>
      </div>

      <CohortsAdminList
        cohorts={list.cohorts}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </main>
  );
}
