import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { AdminPublicReflectionDialog } from "@/components/dashboard/admin-public-reflection-dialog";
import { BlogStatsCards } from "@/components/dashboard/cms-list-stats";
import { BlogsTable } from "@/components/blogs/blogs-table";
import { Button } from "@/components/ui/button";
import { getAdminResource } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
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
  const { list, stats } = await loadAdminListPage({
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
      actions={
        <>
          <AdminPublicReflectionDialog resourceId="blogs" />
          <Button
            className="min-h-11 w-full sm:w-auto"
            nativeButton={false}
            render={<Link href={ROUTES.blogsNew} />}
          >
            <PlusIcon className="size-4" />
            New blog
          </Button>
        </>
      }
    >
      <BlogStatsCards stats={stats} />
      <BlogsTable
        blogs={list.blogs}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </AdminListPageShell>
  );
}
