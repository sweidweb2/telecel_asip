"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { ChartColumnIcon } from "lucide-react";

import { deleteImpactMetric } from "@/actions/impact-metrics";
import { AdminClickableRow } from "@/components/dashboard/admin-clickable-row";
import {
  AdminDataTable,
  CMS_HEAD_ROW_CLASS,
} from "@/components/dashboard/admin-data-table";
import { AdminEditDeleteActions } from "@/components/dashboard/admin-edit-delete-actions";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import {
  AdminRowNumberCell,
  AdminRowNumberHead,
} from "@/components/dashboard/admin-row-number";
import { ImpactMetricsFilters } from "@/components/impact-metrics/impact-metrics-filters";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import {
  IMPACT_LENS_LABELS,
  IMPACT_PUBLISH_STATUS_LABELS,
} from "@/constants/impact-metric-labels";
import { impactMetricDetailPath, ROUTES } from "@/constants/routes";
import { adminListFiltersActive } from "@/lib/admin/list-filters-active";
import type { ImpactMetricListItem } from "@/types/impact-metric";
import {
  IMPACT_METRIC_PAGE_SIZE,
  type ImpactMetricListQuery,
} from "@/validations/impact-metric";

function publishVariant(
  status: ImpactMetricListItem["publish_status"],
): "default" | "secondary" | "outline" | "destructive" {
  if (status === "verified") return "default";
  if (status === "pending") return "secondary";
  if (status === "disputed" || status === "not_for_publication") {
    return "destructive";
  }
  return "outline";
}

export function ImpactMetricsTable({
  metrics,
  total,
  totalPages,
  query,
}: {
  metrics: ImpactMetricListItem[];
  total: number;
  totalPages: number;
  query: ImpactMetricListQuery;
}) {
  const router = useRouter();
  const listFilters = {
    search: query.search,
    lens: query.lens === "all" ? undefined : query.lens,
    publishStatus:
      query.publishStatus === "all" ? undefined : query.publishStatus,
  };
  const isFiltered = adminListFiltersActive(listFilters);

  return (
    <AdminDataTable
      filters={<ImpactMetricsFilters query={query} />}
      header={
        <TableRow className={CMS_HEAD_ROW_CLASS}>
          <AdminRowNumberHead />
          <TableHead>Claim</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Lens</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Evidence</TableHead>
          <TableHead className="w-24 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={metrics.length === 0}
      emptyColSpan={7}
      empty={
        <AdminEmptyState
          icon={ChartColumnIcon}
          isFiltered={isFiltered}
          emptyTitle="No impact metrics yet"
          emptyDescription="Create the first impact metric to publish on the site."
          noResultsTitle="No impact metrics found"
          noResultsDescription="Try changing the filters or clearing search."
          createHref={ROUTES.impactMetricsNew}
          createLabel="New metric"
        />
      }
      pagination={{
        basePath: ROUTES.impactMetrics,
        page: query.page,
        pageSize: IMPACT_METRIC_PAGE_SIZE,
        total,
        totalPages,
        filters: listFilters,
      }}
    >
      {metrics.map((metric, index) => (
        <AdminClickableRow
          key={metric.id}
          ariaLabel={`Edit impact metric ${metric.claim_label}`}
          onActivate={() => router.push(impactMetricDetailPath(metric.id))}
        >
          <AdminRowNumberCell
            page={query.page}
            pageSize={IMPACT_METRIC_PAGE_SIZE}
            index={index}
          />
          <TableCell className="max-w-[10rem] font-medium sm:max-w-[14rem]">
            <Link
              href={impactMetricDetailPath(metric.id)}
              title={metric.claim_label}
              className="block truncate hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              {metric.claim_label}
            </Link>
          </TableCell>
          <TableCell className="whitespace-nowrap">
            {metric.value}
            {metric.unit ? (
              <span className="ml-1 text-muted-foreground">{metric.unit}</span>
            ) : null}
          </TableCell>
          <TableCell className="max-w-[10rem]">
            {metric.impact_lens ? (
              <Badge
                variant="secondary"
                className="max-w-full"
                title={IMPACT_LENS_LABELS[metric.impact_lens]}
              >
                <span className="truncate">
                  {IMPACT_LENS_LABELS[metric.impact_lens]}
                </span>
              </Badge>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </TableCell>
          <TableCell className="whitespace-nowrap">
            <Badge variant={publishVariant(metric.publish_status)}>
              {IMPACT_PUBLISH_STATUS_LABELS[metric.publish_status]}
            </Badge>
          </TableCell>
          <TableCell className="max-w-[12rem] text-muted-foreground">
            <span
              className="block truncate"
              title={metric.evidence_primary_source ?? undefined}
            >
              {metric.evidence_primary_source || "-"}
            </span>
          </TableCell>
          <TableCell
            className="pr-4 whitespace-nowrap"
            onClick={(event) => event.stopPropagation()}
          >
            <AdminEditDeleteActions
              editHref={impactMetricDetailPath(metric.id)}
              editLabel={`Edit ${metric.claim_label}`}
              deleteAction={() => deleteImpactMetric({ id: metric.id })}
              fallbackError="The impact metric could not be deleted. Please try again."
              title="Delete impact metric?"
              description={
                <>
                  This permanently deletes “{metric.claim_label}”. This cannot
                  be undone.
                </>
              }
              confirmLabel="Delete metric"
              triggerLabel={`Delete ${metric.claim_label}`}
            />
          </TableCell>
        </AdminClickableRow>
      ))}
    </AdminDataTable>
  );
}
