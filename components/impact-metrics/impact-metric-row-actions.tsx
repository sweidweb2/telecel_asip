"use client";

import Link from "next/link";
import { PencilIcon } from "lucide-react";

import { deleteImpactMetric } from "@/actions/impact-metrics";
import { ADMIN_ICON_BUTTON_CLASS } from "@/components/dashboard/admin-icon-button";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { ImpactMetricFormDialog } from "@/components/impact-metrics/impact-metric-form-dialog";
import { Button } from "@/components/ui/button";
import { impactMetricDetailPath, ROUTES } from "@/constants/routes";
import type {
  EvidenceOption,
  ImpactMetric,
  ImpactMetricListItem,
} from "@/types/impact-metric";

type ImpactMetricRowActionsProps = {
  metric: ImpactMetricListItem | ImpactMetric;
  /** Optional seed; dialog lazy-loads / searches the rest. */
  evidenceOptions?: EvidenceOption[];
  redirectOnDelete?: boolean;
};

function isFullMetric(
  metric: ImpactMetricListItem | ImpactMetric,
): metric is ImpactMetric {
  return "period_start" in metric && "display_locations" in metric;
}

export function ImpactMetricRowActions({
  metric,
  evidenceOptions,
  redirectOnDelete = false,
}: ImpactMetricRowActionsProps) {
  const canInlineEdit = isFullMetric(metric);

  return (
    <div className="flex items-center justify-end gap-0.5">
      {canInlineEdit ? (
        <ImpactMetricFormDialog
          mode="edit"
          metric={metric}
          evidenceOptions={evidenceOptions}
          triggerRender={
            <Button
              variant="ghost"
              size="icon"
              className={ADMIN_ICON_BUTTON_CLASS}
              aria-label={`Edit ${metric.claim_label}`}
            />
          }
          triggerContent={<PencilIcon />}
        />
      ) : (
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
      )}

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
