import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { FounderStoriesTable } from "@/components/founder-stories/founder-stories-table";
import { Button } from "@/components/ui/button";
import { getAdminResource } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
import { getFounderStoriesPageData } from "@/data/founder-stories";
import {
  adminListClampParams,
  loadAdminListPage,
} from "@/lib/admin/load-admin-list-page";
import { parseFounderStoryListQuery } from "@/validations/founder-story";

const resource = getAdminResource("founderStories");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type FounderStoriesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FounderStoriesPage({
  searchParams,
}: FounderStoriesPageProps) {
  const query = parseFounderStoryListQuery(await searchParams);
  const { list } = await loadAdminListPage({
    query,
    fetchPage: getFounderStoriesPageData,
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
          render={<Link href={ROUTES.founderStoriesNew} />}
        >
          <PlusIcon className="size-4" />
          New story
        </Button>
      }
    >
      <FounderStoriesTable
        stories={list.stories}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </AdminListPageShell>
  );
}
