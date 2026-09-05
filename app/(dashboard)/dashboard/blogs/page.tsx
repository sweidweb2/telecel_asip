import type { Metadata } from "next";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { BlogsAdminList } from "@/components/blogs/blogs-admin-list";
import { getAdminResource } from "@/constants/admin-resources";
import { getBlogsPageData } from "@/data/blogs";
import {
  adminListClampParams,
  loadAdminListPage,
} from "@/lib/admin/load-admin-list-page";
import { parseBlogListQuery } from "@/validations/blog";

const resource = getAdminResource("blogs");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type BlogsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const query = parseBlogListQuery(await searchParams);
  const { list } = await loadAdminListPage({
    query,
    fetchPage: getBlogsPageData,
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
    >
      <BlogsAdminList
        blogs={list.blogs}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </AdminListPageShell>
  );
}
