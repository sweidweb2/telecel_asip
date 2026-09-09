"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { BookOpenIcon } from "lucide-react";

import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import {
  AdminRowNumberCell,
  AdminRowNumberHead,
} from "@/components/dashboard/admin-row-number";
import { FounderStoriesFilters } from "@/components/founder-stories/founder-stories-filters";
import { FounderStoryRowActions } from "@/components/founder-stories/founder-story-row-actions";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { founderStoryEditPath, ROUTES } from "@/constants/routes";
import { formatAdminDate } from "@/lib/admin-format";
import type { FounderStoryListItem } from "@/types/founder-story";
import {
  CMS_PUBLISH_STATUS_LABELS,
  FOUNDER_STORY_PAGE_SIZE,
  QUOTE_PERMISSION_STATUS_LABELS,
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
          <AdminRowNumberHead />
          <TableHead>Startup</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Quote</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="w-24 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={stories.length === 0}
      emptyColSpan={6}
      empty={
        <AdminEmptyState
          icon={BookOpenIcon}
          title="No founder stories found"
          description="Try changing the filters, or create a new story."
          createHref={ROUTES.founderStoriesNew}
          createLabel="New story"
        />
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
      {stories.map((story, index) => (
        <TableRow
          key={story.id}
          className="cursor-pointer"
          onClick={() => router.push(founderStoryEditPath(story.id))}
        >
          <AdminRowNumberCell
            page={query.page}
            pageSize={FOUNDER_STORY_PAGE_SIZE}
            index={index}
          />
          <TableCell className="max-w-[12rem] font-medium sm:max-w-[18rem]">
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
              {CMS_PUBLISH_STATUS_LABELS[story.publish_status]}
            </Badge>
          </TableCell>
          <TableCell className="text-muted-foreground">
            {story.quote_permission_status
              ? QUOTE_PERMISSION_STATUS_LABELS[story.quote_permission_status]
              : "-"}
          </TableCell>
          <TableCell className="whitespace-nowrap text-muted-foreground">
            {formatAdminDate(story.updated_at)}
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
