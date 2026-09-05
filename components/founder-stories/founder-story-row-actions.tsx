"use client";

import Link from "next/link";
import { PencilIcon } from "lucide-react";

import { deleteFounderStory } from "@/actions/founder-stories";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { Button } from "@/components/ui/button";
import { founderStoryEditPath, ROUTES } from "@/constants/routes";
import type { FounderStoryListItem } from "@/types/founder-story";

type FounderStoryRowActionsProps = {
  story: FounderStoryListItem;
  redirectOnDelete?: boolean;
};

export function FounderStoryRowActions({
  story,
  redirectOnDelete = false,
}: FounderStoryRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Edit ${story.startup_name}`}
        nativeButton={false}
        render={<Link href={founderStoryEditPath(story.id)} />}
      >
        <PencilIcon />
      </Button>

      <AdminRowDelete
        deleteAction={() => deleteFounderStory({ id: story.id })}
        redirectTo={redirectOnDelete ? ROUTES.founderStories : undefined}
        fallbackError="The story could not be deleted. Please try again."
        title="Delete founder story?"
        description={
          <>
            This permanently deletes the story for {story.startup_name}. This
            cannot be undone.
          </>
        }
        confirmLabel="Delete story"
        triggerLabel={`Delete ${story.startup_name}`}
      />
    </div>
  );
}
