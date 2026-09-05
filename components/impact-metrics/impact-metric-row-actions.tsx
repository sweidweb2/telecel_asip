"use client";

import Link from "next/link";
import { PencilIcon } from "lucide-react";

import { deleteImpactMetric } from "@/actions/impact-metrics";
import { ADMIN_ICON_BUTTON_CLASS } from "@/components/dashboard/admin-icon-button";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { Button } from "@/components/ui/button";
import { impactMetricDetailPath, ROUTES } from "@/constants/routes";
import type {
  ImpactMetric,
  ImpactMetricListItem,
} from "@/types/impact-metric";

type ImpactMetricRowActionsProps = {
  metric: ImpactMetricListItem | ImpactMetric;
  redirectOnDelete?: boolean;
};

export function ImpactMetricRowActions({
  metric,
  redirectOnDelete = false,
}: ImpactMetricRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className={ADMIN_ICON_BUTTON_CLASS}
        aria-label={`Edit ${metric.claim_label}`}
        nativeButton={false}
        render={<Link href={impactMetricDetailPath(metric.id)} />}
      >
        <PencilIcon />
      </Button>

      <AdminRowDelete
        deleteAction={() => deleteImpactMetric({ id: metric.id })}
        redirectTo={redirectOnDelete ? ROUTES.impactMetrics : undefined}
        fallbackError="The impact metric could not be deleted. Please try again."
        title="Delete impact metric?"
        description={
          <>
            This permanently deletes “{metric.claim_label}”. This cannot be
            undone.
          </>
        }
        confirmLabel="Delete metric"
        triggerLabel={`Delete ${metric.claim_label}`}
      />
    </div>
  );
}
