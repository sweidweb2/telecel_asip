"use client";

import { deleteFounderStory } from "@/actions/founder-stories";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { AdminRowEditLink } from "@/components/dashboard/admin-row-edit-link";
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
      <AdminRowEditLink
        href={founderStoryEditPath(story.id)}
        label={`Edit ${story.startup_name}`}
      />

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
