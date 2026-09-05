"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { BookOpenIcon } from "lucide-react";
import { format } from "date-fns";

import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { FounderStoriesFilters } from "@/components/founder-stories/founder-stories-filters";
import { FounderStoryRowActions } from "@/components/founder-stories/founder-story-row-actions";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { founderStoryEditPath, ROUTES } from "@/constants/routes";
import type { FounderStoryListItem } from "@/types/founder-story";
import {
  FOUNDER_STORY_PAGE_SIZE,
  type FounderStoryListQuery,
} from "@/validations/founder-story";

export function FounderStoriesTable({
  stories,
  total,
  totalPages,
  query,
}: {
  stories: FounderStoryListItem[];
  total: number;
  totalPages: number;
  query: FounderStoryListQuery;
}) {
  const router = useRouter();

  return (
    <AdminDataTable
      filters={<FounderStoriesFilters query={query} />}
      header={
        <TableRow>
          <TableHead className="pl-4">Startup</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Quote</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="w-24 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={stories.length === 0}
      emptyColSpan={5}
      empty={
        <div className="mx-auto flex max-w-sm flex-col items-center gap-2 whitespace-normal">
          <span className="flex size-10 items-center justify-center rounded-full bg-muted">
            <BookOpenIcon className="size-5 text-muted-foreground" />
          </span>
          <p className="font-medium">No founder stories found</p>
          <p className="text-sm text-muted-foreground">
            Try changing the filters, or create a new story.
          </p>
        </div>
      }
      pagination={{
        basePath: ROUTES.founderStories,
        page: query.page,
        pageSize: FOUNDER_STORY_PAGE_SIZE,
        total,
        totalPages,
        filters: {
          search: query.search || undefined,
          status: query.status === "all" ? undefined : query.status,
        },
      }}
    >
      {stories.map((story) => (
        <TableRow
          key={story.id}
          className="cursor-pointer"
          onClick={() => router.push(founderStoryEditPath(story.id))}
        >
          <TableCell className="max-w-[12rem] pl-4 font-medium sm:max-w-[18rem]">
            <Link
              href={founderStoryEditPath(story.id)}
              title={story.startup_name}
              className="block truncate hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              {story.startup_name || "Untitled startup"}
            </Link>
          </TableCell>
          <TableCell>
            <Badge
              variant={
                story.publish_status === "published" ? "default" : "secondary"
              }
            >
              {story.publish_status}
            </Badge>
          </TableCell>
          <TableCell className="text-muted-foreground">
            {story.quote_permission_status ?? "—"}
          </TableCell>
          <TableCell className="whitespace-nowrap text-muted-foreground">
            {format(new Date(story.updated_at), "d MMM yyyy")}
          </TableCell>
          <TableCell
            className="pr-4 text-right"
            onClick={(event) => event.stopPropagation()}
          >
            <FounderStoryRowActions story={story} />
          </TableCell>
        </TableRow>
      ))}
    </AdminDataTable>
  );
}
