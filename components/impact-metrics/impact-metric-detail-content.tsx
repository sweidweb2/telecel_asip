import Link from "next/link";
import {
  CalendarIcon,
  ChartColumnIcon,
  GlobeIcon,
  LinkIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { ImpactMetricRowActions } from "@/components/impact-metrics/impact-metric-row-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  IMPACT_LENS_LABELS,
  IMPACT_PUBLISH_STATUS_LABELS,
} from "@/constants/impact-metric-labels";
import { evidenceDetailPath } from "@/constants/routes";
import { formatAdminDate, formatAdminDateTime } from "@/lib/admin-format";
import type { ImpactMetric } from "@/types/impact-metric";

function Stat({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof LinkIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-1 text-sm break-words">{children}</dd>
      </div>
    </div>
  );
}

export function ImpactMetricDetailContent({
  metric,
  evidencePrimarySource,
}: {
  metric: ImpactMetric;
  evidencePrimarySource: string | null;
}) {
  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-3">
      <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="line-clamp-2 font-heading text-2xl tracking-tight break-words">
                {metric.claim_label}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {metric.value}
                </span>
                {metric.unit ? ` ${metric.unit}` : null}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:mt-1">
              <ImpactMetricRowActions metric={metric} redirectOnDelete />
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Badge
                variant={
                  metric.publish_status === "verified" ? "default" : "secondary"
                }
              >
                <ShieldCheckIcon />
                {IMPACT_PUBLISH_STATUS_LABELS[metric.publish_status]}
              </Badge>
              {metric.impact_lens ? (
                <Badge variant="secondary">
                  <ChartColumnIcon />
                  {IMPACT_LENS_LABELS[metric.impact_lens]}
                </Badge>
              ) : null}
            </div>

            <Separator />

            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Stat icon={CalendarIcon} label="Measurement period">
                {formatAdminDate(metric.period_start)}
                {" – "}
                {formatAdminDate(metric.period_end)}
              </Stat>

              <Stat icon={MapPinIcon} label="Geography">
                {metric.geography || (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </Stat>

              <Stat icon={LinkIcon} label="Evidence">
                <Link
                  href={evidenceDetailPath(metric.evidence_id)}
                  className="text-primary hover:underline"
                >
                  {evidencePrimarySource || metric.evidence_id}
                </Link>
              </Stat>

              <Stat icon={GlobeIcon} label="Display locations">
                {metric.display_locations &&
                metric.display_locations.length > 0 ? (
                  <ul className="list-inside list-disc">
                    {metric.display_locations.map((location) => (
                      <li key={location}>{location}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </Stat>

              <Stat icon={CalendarIcon} label="Created">
                {formatAdminDateTime(metric.created_at)}
              </Stat>

              <Stat icon={CalendarIcon} label="Last updated">
                {formatAdminDateTime(metric.updated_at)}
              </Stat>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Record</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-1 text-xs">
              <dt className="font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Metric ID
              </dt>
              <dd className="break-all font-mono">{metric.id}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
