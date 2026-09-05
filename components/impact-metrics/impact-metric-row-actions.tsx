"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";

import { deleteImpactMetric } from "@/actions/impact-metrics";
import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import { ImpactMetricFormDialog } from "@/components/impact-metrics/impact-metric-form-dialog";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { EvidenceOption, ImpactMetricListItem } from "@/types/impact-metric";

type ImpactMetricRowActionsProps = {
  metric: ImpactMetricListItem;
  evidenceOptions: EvidenceOption[];
  redirectOnDelete?: boolean;
};

export function ImpactMetricRowActions({
  metric,
  evidenceOptions,
  redirectOnDelete = false,
}: ImpactMetricRowActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  function onDelete() {
    startDelete(async () => {
      try {
        const result = await deleteImpactMetric({ id: metric.id });
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        setDeleteOpen(false);
        if (redirectOnDelete) {
          router.push(ROUTES.impactMetrics);
          return;
        }
        router.refresh();
      } catch {
        toast.error("The impact metric could not be deleted. Please try again.");
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
      <ImpactMetricFormDialog
        mode="edit"
        metric={metric}
        evidenceOptions={evidenceOptions}
        triggerRender={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${metric.claim_label}`}
          />
        }
        triggerContent={<PencilIcon />}
      />

      <AdminDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete impact metric?"
        description={
          <>
            This permanently deletes “{metric.claim_label}”. This cannot be
            undone.
          </>
        }
        confirmLabel="Delete metric"
        triggerLabel={`Delete ${metric.claim_label}`}
        isPending={isDeleting}
        onConfirm={onDelete}
      />
    </div>
  );
}
