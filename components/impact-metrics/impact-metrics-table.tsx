"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { ChartColumnIcon } from "lucide-react";

import { ImpactMetricRowActions } from "@/components/impact-metrics/impact-metric-row-actions";
import { ImpactMetricsFilters } from "@/components/impact-metrics/impact-metrics-filters";
import { AdminPagination } from "@/components/dashboard/admin-pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IMPACT_LENS_LABELS,
  IMPACT_PUBLISH_STATUS_LABELS,
} from "@/constants/impact-metric-labels";
import { impactMetricDetailPath, ROUTES } from "@/constants/routes";
import type {
  EvidenceOption,
  ImpactMetricListItem,
} from "@/types/impact-metric";
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
  evidenceOptions,
}: {
  metrics: ImpactMetricListItem[];
  total: number;
  totalPages: number;
  query: ImpactMetricListQuery;
  evidenceOptions: EvidenceOption[];
}) {
  const router = useRouter();

  return (
    <Card className="min-w-0 gap-0 overflow-hidden py-0">
      <ImpactMetricsFilters query={query} />

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Claim</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Lens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Evidence</TableHead>
                <TableHead className="w-24 pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 whitespace-normal">
                      <span className="flex size-10 items-center justify-center rounded-full bg-muted">
                        <ChartColumnIcon className="size-5 text-muted-foreground" />
                      </span>
                      <p className="font-medium">No impact metrics found</p>
                      <p className="text-sm text-muted-foreground">
                        Try changing the filters, or create a new metric.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                metrics.map((metric) => (
                  <TableRow
                    key={metric.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(impactMetricDetailPath(metric.id))
                    }
                  >
                    <TableCell className="max-w-[10rem] pl-4 font-medium sm:max-w-[14rem]">
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
                        <span className="ml-1 text-muted-foreground">
                          {metric.unit}
                        </span>
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
                        <span className="text-muted-foreground">—</span>
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
                        {metric.evidence_primary_source || "—"}
                      </span>
                    </TableCell>
                    <TableCell
                      className="pr-4 whitespace-nowrap"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <ImpactMetricRowActions
                        metric={metric}
                        evidenceOptions={evidenceOptions}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="border-t bg-transparent px-4 py-3">
        <AdminPagination
          basePath={ROUTES.impactMetrics}
          page={query.page}
          pageSize={IMPACT_METRIC_PAGE_SIZE}
          total={total}
          totalPages={totalPages}
          filters={{
            search: query.search,
            lens: query.lens === "all" ? undefined : query.lens,
            publishStatus:
              query.publishStatus === "all" ? undefined : query.publishStatus,
          }}
        />
      </CardFooter>
    </Card>
  );
}
