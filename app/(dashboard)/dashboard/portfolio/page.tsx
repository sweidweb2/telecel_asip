import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StartupsAdminList } from "@/components/startups/startups-admin-list";
import { ROUTES } from "@/constants/routes";
import { getStartupsPageData } from "@/data/startups";
import { parseStartupListQuery } from "@/validations/startup";

export const metadata: Metadata = {
  title: "Portfolio | ASIP Admin",
};

type PortfolioPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortfolioAdminPage({
  searchParams,
}: PortfolioPageProps) {
  const query = parseStartupListQuery(await searchParams);
  const result = await getStartupsPageData(query);

  if (result.status === "forbidden") redirect(ROUTES.dashboard);

  const { list } = result;

  if (query.page > list.totalPages) {
    const params = new URLSearchParams({
      page: String(list.totalPages),
    });
    if (query.search) params.set("search", query.search);
    if (query.status !== "all") params.set("status", query.status);
    redirect(`${ROUTES.portfolio}?${params.toString()}`);
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="min-w-0">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Portfolio
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage startups shown on the public portfolio. Only active startups
          are visible publicly.
        </p>
      </div>
      <StartupsAdminList
        startups={list.startups}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </main>
  );
}
