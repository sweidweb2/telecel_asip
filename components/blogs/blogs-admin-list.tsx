"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useTransition } from "react";
import { Loader2Icon, PlusIcon, SearchIcon } from "lucide-react";

import { BlogAdminCard } from "@/components/blogs/blog-admin-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import type { BlogListItem } from "@/types/blog";
import type { BlogListQuery } from "@/validations/blog";

type BlogsAdminListProps = {
  blogs: BlogListItem[];
  total: number;
  totalPages: number;
  query: BlogListQuery;
};

export function BlogsAdminList({
  blogs,
  total,
  totalPages,
  query,
}: BlogsAdminListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPagePending, startPageTransition] = useTransition();
  const { search, isPending, navigate, handleSearchChange } =
    useAdminListFilters({
      basePath: ROUTES.blogs,
      search: query.search,
    });

  const busy = isPending || isPagePending;

  function goToPage(page: number) {
    const next = new URLSearchParams(searchParams.toString());
    if (page <= 1) next.delete("page");
    else next.set("page", String(page));
    const qs = next.toString();
    startPageTransition(() => {
      router.push(qs ? `${ROUTES.blogs}?${qs}` : ROUTES.blogs);
    });
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Label htmlFor="blogs-search" className="sr-only">
              Search blogs
            </Label>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="blogs-search"
              type="search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search title, slug, or author"
              maxLength={100}
              autoComplete="off"
              className="min-h-11 pl-9"
            />
            {isPending ? (
              <Loader2Icon className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : null}
          </div>
          <Select
            value={query.status}
            onValueChange={(value) => {
              if (value) navigate({ status: value });
            }}
            disabled={busy}
          >
            <SelectTrigger className="min-h-11 w-full sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          className="min-h-11 w-full sm:w-auto"
          nativeButton={false}
          render={<Link href={`${ROUTES.blogs}/new`} />}
        >
          <PlusIcon className="size-4" />
          New blog
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {total} post{total === 1 ? "" : "s"}
      </p>

      {blogs.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="font-heading text-lg font-semibold">No blogs yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first insight post to appear on the public Insights
            pages.
          </p>
          <Button
            className="mt-6 min-h-11"
            nativeButton={false}
            render={<Link href={`${ROUTES.blogs}/new`} />}
          >
            <PlusIcon className="size-4" />
            New blog
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <li key={blog.id}>
              <BlogAdminCard blog={blog} />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={busy || query.page <= 1}
            onClick={() => goToPage(Math.max(1, query.page - 1))}
          >
            Previous
          </Button>
          <p className="text-sm text-muted-foreground">
            Page {query.page} of {totalPages}
          </p>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={busy || query.page >= totalPages}
            onClick={() => goToPage(Math.min(totalPages, query.page + 1))}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
