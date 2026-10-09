"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { NewspaperIcon } from "lucide-react";

import { deleteBlog } from "@/actions/blogs";
import { BlogStatusToggle } from "@/components/blogs/blog-status-toggle";
import { BlogsFilters } from "@/components/blogs/blogs-filters";
import { AdminClickableRow } from "@/components/dashboard/admin-clickable-row";
import {
  AdminDataTable,
  CMS_HEAD_ROW_CLASS,
} from "@/components/dashboard/admin-data-table";
import { AdminEditDeleteActions } from "@/components/dashboard/admin-edit-delete-actions";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import {
  AdminRowNumberCell,
  AdminRowNumberHead,
} from "@/components/dashboard/admin-row-number";
import { AdminSortableHead } from "@/components/dashboard/admin-sortable-head";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { formatAdminDate } from "@/lib/admin-format";
import { adminListFiltersActive } from "@/lib/admin/list-filters-active";
import type { BlogListItem } from "@/types/blog";
import { BLOG_PAGE_SIZE, type BlogListQuery } from "@/validations/blog";

function blogsListFilters(query: BlogListQuery) {
  const isDefaultSort =
    query.sort === "created_at" && query.dir === "desc";
  return {
    search: query.search || undefined,
    status: query.status === "all" ? undefined : query.status,
    sort: isDefaultSort ? undefined : query.sort,
    dir: isDefaultSort ? undefined : query.dir,
  };
}

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
  const listFilters = blogsListFilters(query);
  const sortFilters = {
    search: listFilters.search,
    status: listFilters.status,
  };
  const isFiltered = adminListFiltersActive({
    search: listFilters.search,
    status: listFilters.status,
  });

  return (
    <AdminDataTable
      filters={<BlogsFilters query={query} />}
      header={
        <TableRow className={CMS_HEAD_ROW_CLASS}>
          <AdminRowNumberHead />
          <AdminSortableHead
            label="Title"
            sortKey="title"
            currentSort={query.sort}
            currentDir={query.dir}
            basePath={ROUTES.blogs}
            filters={sortFilters}
          />
          <AdminSortableHead
            label="Status"
            sortKey="status"
            currentSort={query.sort}
            currentDir={query.dir}
            basePath={ROUTES.blogs}
            filters={sortFilters}
          />
          <AdminSortableHead
            label="Author"
            sortKey="author_name"
            currentSort={query.sort}
            currentDir={query.dir}
            basePath={ROUTES.blogs}
            filters={sortFilters}
          />
          <AdminSortableHead
            label="Updated"
            sortKey="updated_at"
            currentSort={query.sort}
            currentDir={query.dir}
            basePath={ROUTES.blogs}
            filters={sortFilters}
          />
          <TableHead className="w-24 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={blogs.length === 0}
      emptyColSpan={6}
      empty={
        <AdminEmptyState
          icon={NewspaperIcon}
          isFiltered={isFiltered}
          emptyTitle="No blogs yet"
          emptyDescription="Create the first Insights article to publish on the site."
          noResultsTitle="No blogs found"
          noResultsDescription="Try changing the filters or clearing search."
          createHref={ROUTES.blogsNew}
          createLabel="New blog"
        />
      }
      pagination={{
        basePath: ROUTES.blogs,
        page: query.page,
        pageSize: BLOG_PAGE_SIZE,
        total,
        totalPages,
        filters: listFilters,
      }}
    >
      {blogs.map((blog, index) => {
        const href = `${ROUTES.blogs}/${blog.id}`;
        return (
          <AdminClickableRow
            key={blog.id}
            ariaLabel={`Edit blog ${blog.title || "Untitled"}`}
            className={blog.is_featured ? "border-l-4 border-l-primary" : undefined}
            onActivate={() => router.push(href)}
          >
            <AdminRowNumberCell
              page={query.page}
              pageSize={BLOG_PAGE_SIZE}
              index={index}
            />
            <TableCell className="max-w-[14rem] font-medium sm:max-w-[22rem]">
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
                  Featured
                </Badge>
              ) : null}
            </TableCell>
            <TableCell onClick={(event) => event.stopPropagation()}>
              <BlogStatusToggle blogId={blog.id} status={blog.status} />
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
              <AdminEditDeleteActions
                editHref={`${ROUTES.blogs}/${blog.id}`}
                editLabel={`Edit ${blog.title}`}
                deleteAction={() => deleteBlog({ id: blog.id })}
                fallbackError="The blog could not be deleted. Please try again."
                title="Delete blog?"
                description={
                  <>
                    This permanently deletes “{blog.title}” and its images.
                    This cannot be undone.
                  </>
                }
                confirmLabel="Delete blog"
                triggerLabel={`Delete ${blog.title}`}
              />
            </TableCell>
          </AdminClickableRow>
        );
      })}
    </AdminDataTable>
  );
}
