import type { Metadata } from "next";

import { CmsListPage } from "@/components/dashboard/cms-list-page";
import { FounderStoryStatsCards } from "@/components/dashboard/cms-list-stats";
import { FounderStoriesTable } from "@/components/founder-stories/founder-stories-table";
import { getAdminResource } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
import { getFounderStoriesPageData } from "@/data/founder-stories";
import { parseFounderStoryListQuery } from "@/validations/founder-story";

const resource = getAdminResource("founderStories");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type FounderStoriesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function FounderStoriesPage({
  searchParams,
}: FounderStoriesPageProps) {
  return (
    <CmsListPage
      resourceId="founderStories"
      searchParams={searchParams}
      parseQuery={parseFounderStoryListQuery}
      fetchPage={getFounderStoriesPageData}
      activeFilters={(query) => ({
        search: query.search || undefined,
        status: query.status !== "all" ? query.status : undefined,
      })}
      newItem={{ href: ROUTES.founderStoriesNew, label: "New story" }}
      showPublicReflection
      stats={(result) => <FounderStoryStatsCards stats={result.stats} />}
    >
      {({ query, result }) => (
        <FounderStoriesTable
          stories={result.list.stories}
          total={result.list.total}
          totalPages={result.list.totalPages}
          query={query}
        />
      )}
    </CmsListPage>
  );
}
