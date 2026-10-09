"use client";

import { deleteImpactMetric } from "@/actions/impact-metrics";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { AdminRowEditLink } from "@/components/dashboard/admin-row-edit-link";
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
      <AdminRowEditLink
        href={impactMetricDetailPath(metric.id)}
        label={`Edit ${metric.claim_label}`}
      />

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
