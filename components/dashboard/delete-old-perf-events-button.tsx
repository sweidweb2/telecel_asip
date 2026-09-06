"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { deleteOldAdminPerfEvents } from "@/actions/admin-perf-events";
import { Button } from "@/components/ui/button";

export function DeleteOldPerfEventsButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      className="min-h-11 w-full shrink-0 sm:w-auto"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await deleteOldAdminPerfEvents();
          if (result.status === "error") {
            toast.error(result.message);
            return;
          }
          toast.success(result.message);
        });
      }}
    >
      Delete events older than 7 days
    </Button>
  );
}
