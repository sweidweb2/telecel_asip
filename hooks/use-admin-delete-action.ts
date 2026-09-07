"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";

import type { AdminActionResult } from "@/types/admin-action";

type UseAdminDeleteActionOptions = {
  /** Server action that deletes the current row. */
  deleteAction: () => Promise<AdminActionResult>;
  /** When set, navigate here after a successful delete instead of refreshing. */
  redirectTo?: string;
  /** Toast when the action throws. */
  fallbackError: string;
};

/**
 * Shared delete transition + toast + refresh/redirect for CMS row actions.
 */
export function useAdminDeleteAction({
  deleteAction,
  redirectTo,
  fallbackError,
}: UseAdminDeleteActionOptions) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  function onDelete() {
    startDelete(async () => {
      try {
        const result = await deleteAction();
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        setDeleteOpen(false);
        if (redirectTo) {
          router.push(redirectTo);
          return;
        }
        router.refresh();
      } catch {
        toast.error(fallbackError);
      }
    });
  }

  return {
    deleteOpen,
    setDeleteOpen,
    isDeleting,
    onDelete,
  };
}
