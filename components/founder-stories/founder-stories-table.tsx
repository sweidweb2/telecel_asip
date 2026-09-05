"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { BookOpenIcon } from "lucide-react";
import { format } from "date-fns";

import { FounderStoriesFilters } from "@/components/founder-stories/founder-stories-filters";
import { FounderStoryRowActions } from "@/components/founder-stories/founder-story-row-actions";
import { AdminPagination } from "@/components/dashboard/admin-pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <Card className="min-w-0 gap-0 overflow-hidden py-0">
      <FounderStoriesFilters query={query} />

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Startup</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quote</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-24 pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 whitespace-normal">
                      <span className="flex size-10 items-center justify-center rounded-full bg-muted">
                        <BookOpenIcon className="size-5 text-muted-foreground" />
                      </span>
                      <p className="font-medium">No founder stories found</p>
                      <p className="text-sm text-muted-foreground">
                        Try changing the filters, or create a new story.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                stories.map((story) => (
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
                      <p className="mt-0.5 line-clamp-1 text-xs font-normal text-muted-foreground">
                        {story.the_problem}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          story.publish_status === "published"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {story.publish_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {story.founder_quote_text
                        ? (story.quote_permission_status ?? "set")
                        : "—"}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="border-t px-4 py-3">
        <AdminPagination
          basePath={ROUTES.founderStories}
          page={query.page}
          pageSize={FOUNDER_STORY_PAGE_SIZE}
          total={total}
          totalPages={totalPages}
          filters={{
            search: query.search || undefined,
            status: query.status === "all" ? undefined : query.status,
          }}
        />
      </CardFooter>
    </Card>
  );
}
