import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PartnerFormDialog } from "@/components/partners/partner-form-dialog";
import { PartnersTable } from "@/components/partners/partners-table";
import { ROUTES } from "@/constants/routes";
import { getPartnersPageData } from "@/data/partners";
import { parsePartnerListQuery } from "@/validations/partner";

export const metadata: Metadata = {
  title: "Partners | ASIP Admin",
};

type PartnersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PartnersPage({
  searchParams,
}: PartnersPageProps) {
  const query = parsePartnerListQuery(await searchParams);
  const result = await getPartnersPageData(query);

  if (result.status === "forbidden") redirect(ROUTES.dashboard);

  const { list } = result;

  if (query.page > list.totalPages) {
    const params = new URLSearchParams({ page: String(list.totalPages) });
    if (query.search) params.set("search", query.search);
    if (query.type !== "all") params.set("type", query.type);
    if (query.status !== "all") params.set("status", query.status);
    redirect(`${ROUTES.partners}?${params.toString()}`);
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Partners
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Partners and mentors shown on the public partners page.
          </p>
        </div>
        <PartnerFormDialog mode="create" />
      </div>

      <PartnersTable
        partners={list.partners}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </main>
  );
}
