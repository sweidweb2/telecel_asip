import type { Metadata } from "next";

import { BlogsTable } from "@/components/blogs/blogs-table";
import { BlogStatsCards } from "@/components/dashboard/cms-list-stats";
import { CmsListPage } from "@/components/dashboard/cms-list-page";
import { getAdminResource } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
import { getBlogsPageData } from "@/data/blogs";
import { parseBlogListQuery } from "@/validations/blog";

const resource = getAdminResource("blogs");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type BlogsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function BlogsPage({ searchParams }: BlogsPageProps) {
  return (
    <CmsListPage
      resourceId="blogs"
      searchParams={searchParams}
      parseQuery={parseBlogListQuery}
      fetchPage={getBlogsPageData}
      activeFilters={(query) => {
        const isDefaultSort =
          query.sort === "created_at" && query.dir === "desc";
        return {
          search: query.search || undefined,
          status: query.status !== "all" ? query.status : undefined,
          sort: isDefaultSort ? undefined : query.sort,
          dir: isDefaultSort ? undefined : query.dir,
        };
      }}
      newItem={{ href: ROUTES.blogsNew, label: "New blog" }}
      stats={(result) => <BlogStatsCards stats={result.stats} />}
    >
      {({ query, result }) => (
        <BlogsTable
          blogs={result.list.blogs}
          total={result.list.total}
          totalPages={result.list.totalPages}
          query={query}
        />
      )}
    </CmsListPage>
  );
}
