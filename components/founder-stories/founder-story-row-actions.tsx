"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";

import { deleteFounderStory } from "@/actions/founder-stories";
import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
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
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  function onDelete() {
    startDelete(async () => {
      try {
        const result = await deleteFounderStory({ id: story.id });
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        setDeleteOpen(false);
        if (redirectOnDelete) {
          router.push(ROUTES.founderStories);
          return;
        }
        router.refresh();
      } catch {
        toast.error("The story could not be deleted. Please try again.");
      }
    });
  }

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

      <AdminDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete founder story?"
        description={
          <>
            This permanently deletes the story for {story.startup_name}. This
            cannot be undone.
          </>
        }
        confirmLabel="Delete story"
        triggerLabel={`Delete ${story.startup_name}`}
        isPending={isDeleting}
        onConfirm={onDelete}
      />
    </div>
  );
}
