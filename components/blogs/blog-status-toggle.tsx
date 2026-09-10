"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";

import { updateBlogStatus } from "@/actions/blogs";
import { Switch } from "@/components/ui/switch";
import { CMS_PUBLISH_STATUS_LABELS } from "@/constants/cms-publish";
import { toastWithUndo } from "@/lib/admin/toast-with-undo";
import type { BlogStatus } from "@/types/blog";

export function BlogStatusToggle({
  blogId,
  status,
}: {
  blogId: string;
  status: BlogStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [checked, setChecked] = useState(status === "published");
  const [prevStatus, setPrevStatus] = useState(status);

  if (status !== prevStatus) {
    setPrevStatus(status);
    setChecked(status === "published");
  }

  function onCheckedChange(nextChecked: boolean) {
    if (isPending || nextChecked === checked) return;

    const previous = checked;
    const nextStatus: BlogStatus = nextChecked ? "published" : "draft";
    setChecked(nextChecked);

    startTransition(async () => {
      try {
        const result = await updateBlogStatus({
          id: blogId,
          status: nextStatus,
        });
        if (result.status === "error") {
          setChecked(previous);
          toast.error(result.message);
          return;
        }
        toastWithUndo({
          message: result.message,
          onUndo: async () => {
            const undoStatus: BlogStatus = previous ? "published" : "draft";
            setChecked(previous);
            const undoResult = await updateBlogStatus({
              id: blogId,
              status: undoStatus,
            });
            if (undoResult.status === "error") {
              setChecked(nextChecked);
              throw new Error(undoResult.message);
            }
            router.refresh();
          },
        });
        router.refresh();
      } catch {
        setChecked(previous);
        toast.error("Could not update blog status. Please try again.");
      }
    });
  }

  const label = CMS_PUBLISH_STATUS_LABELS[checked ? "published" : "draft"];

  return (
    <div
      className="flex items-center gap-2"
      onClick={(event) => event.stopPropagation()}
    >
      <Switch
        size="sm"
        checked={checked}
        disabled={isPending}
        onCheckedChange={onCheckedChange}
        aria-label={checked ? "Unpublish blog" : "Publish blog"}
      />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
