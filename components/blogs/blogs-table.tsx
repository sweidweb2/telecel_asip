"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { NewspaperIcon } from "lucide-react";

import { BlogRowActions } from "@/components/blogs/blog-row-actions";
import { BlogsFilters } from "@/components/blogs/blogs-filters";
import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { CMS_PUBLISH_STATUS_LABELS } from "@/constants/cms-publish";
import { ROUTES } from "@/constants/routes";
import { formatAdminDate } from "@/lib/admin-format";
import type { BlogListItem } from "@/types/blog";
import { BLOG_PAGE_SIZE, type BlogListQuery } from "@/validations/blog";

export function BlogsTable({
  blogs,
  total,
  totalPages,
  query,
}: {
  blogs: BlogListItem[];
  total: number;
  totalPages: number;
  query: BlogListQuery;
}) {
  const router = useRouter();

  return (
    <AdminDataTable
      filters={<BlogsFilters query={query} />}
      header={
        <TableRow>
          <TableHead className="pl-4">Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="w-24 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={blogs.length === 0}
      emptyColSpan={5}
      empty={
        <AdminEmptyState
          icon={NewspaperIcon}
          title="No blogs found"
          description="Try changing the filters, or create a new blog."
          createHref={`${ROUTES.blogs}/new`}
          createLabel="New blog"
        />
      }
      pagination={{
        basePath: ROUTES.blogs,
        page: query.page,
        pageSize: BLOG_PAGE_SIZE,
        total,
        totalPages,
        filters: {
          search: query.search || undefined,
          status: query.status === "all" ? undefined : query.status,
        },
      }}
    >
      {blogs.map((blog) => {
        const href = `${ROUTES.blogs}/${blog.id}`;
        return (
          <TableRow
            key={blog.id}
            className="cursor-pointer"
            onClick={() => router.push(href)}
          >
            <TableCell className="max-w-[14rem] pl-4 font-medium sm:max-w-[22rem]">
              <Link
                href={href}
                title={blog.title}
                className="block truncate hover:underline"
                onClick={(event) => event.stopPropagation()}
              >
                {blog.title || "Untitled"}
              </Link>
              {blog.is_featured ? (
                <Badge variant="outline" className="mt-1">
                  Hero
                </Badge>
              ) : null}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  blog.status === "published" ? "default" : "secondary"
                }
              >
                {CMS_PUBLISH_STATUS_LABELS[blog.status]}
              </Badge>
            </TableCell>
            <TableCell className="max-w-[10rem] truncate text-muted-foreground">
              {blog.author_name}
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {formatAdminDate(blog.updated_at)}
            </TableCell>
            <TableCell
              className="pr-4 text-right"
              onClick={(event) => event.stopPropagation()}
            >
              <BlogRowActions blog={blog} />
            </TableCell>
          </TableRow>
        );
      })}
    </AdminDataTable>
  );
}
