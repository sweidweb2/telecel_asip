import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { FounderStoriesTable } from "@/components/founder-stories/founder-stories-table";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { getFounderStoriesPageData } from "@/data/founder-stories";
import { parseFounderStoryListQuery } from "@/validations/founder-story";

export const metadata: Metadata = {
  title: "Founder stories | ASIP Admin",
};

type FounderStoriesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FounderStoriesPage({
  searchParams,
}: FounderStoriesPageProps) {
  const query = parseFounderStoryListQuery(await searchParams);
  const result = await getFounderStoriesPageData(query);

  if (result.status === "forbidden") redirect(ROUTES.dashboard);

  const { list } = result;

  if (query.page > list.totalPages) {
    const params = new URLSearchParams({ page: String(list.totalPages) });
    if (query.search) params.set("search", query.search);
    if (query.status !== "all") params.set("status", query.status);
    redirect(`${ROUTES.founderStories}?${params.toString()}`);
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Founder stories
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Narrative modules for founder profiles. Public wiring lands in a
            later phase.
          </p>
        </div>
        <Button
          className="min-h-11 w-full sm:w-auto"
          nativeButton={false}
          render={<Link href={ROUTES.founderStoriesNew} />}
        >
          <PlusIcon className="size-4" />
          New story
        </Button>
      </div>

      <FounderStoriesTable
        stories={list.stories}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </main>
  );
}
