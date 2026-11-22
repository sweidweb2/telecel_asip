import Link from "next/link";

import { AdminSectionHeading } from "@/components/dashboard/admin-section-heading";
import { CMS_HEAD_ROW_CLASS } from "@/components/dashboard/admin-data-table";
import { AdminStatFigure } from "@/components/dashboard/admin-stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import type {
  AdminAnalytics,
  InboxPipelineStats,
} from "@/data/admin-analytics";

function PipelineCard({
  title,
  href,
  stats,
}: {
  title: string;
  href: string;
  stats: InboxPipelineStats;
}) {
  return (
    <Card size="sm">
      <CardHeader className="border-b bg-brand-soft">
        <CardTitle>
          <Link href={href} className="hover:underline">
            {title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <AdminStatFigure label="Total" value={stats.total} />
        <AdminStatFigure label="Unread" value={stats.unread} accent />
        <AdminStatFigure label="Reviewed" value={stats.reviewed} />
        <AdminStatFigure label="Archived" value={stats.archived} />
        <AdminStatFigure label="Last 7 days" value={stats.last7Days} />
        <AdminStatFigure label="Last 30 days" value={stats.last30Days} />
      </CardContent>
    </Card>
  );
}

export function AdminAnalyticsDashboard({
  analytics,
}: {
  analytics: AdminAnalytics;
}) {
  return (
    <div className="grid gap-8">
      <section className="grid gap-3">
        <AdminSectionHeading>Pipeline</AdminSectionHeading>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <PipelineCard
            title="Applications"
            href={ROUTES.applications}
            stats={analytics.applications}
          />
          <PipelineCard
            title="Registrations"
            href={ROUTES.registrations}
            stats={analytics.registrations}
          />
          <PipelineCard
            title="Investor interests"
            href={ROUTES.investorInterests}
            stats={analytics.investorInterests}
          />
          <PipelineCard
            title="Investor engagements"
            href={ROUTES.investorEngagements}
            stats={analytics.investorEngagements}
          />
          <PipelineCard
            title="Contact messages"
            href={ROUTES.contactUs}
            stats={analytics.contactMessages}
          />
        </div>
      </section>

      <section className="grid gap-3">
        <AdminSectionHeading>Content</AdminSectionHeading>
        <Card className="min-w-0 gap-0 overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[28rem] caption-bottom text-sm">
                <TableHeader>
                  <TableRow className={CMS_HEAD_ROW_CLASS}>
                    <TableHead>Section</TableHead>
                    <TableHead>Primary</TableHead>
                    <TableHead>Secondary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.content.map((row) => (
                    <TableRow key={row.href}>
                      <TableCell className="font-medium whitespace-normal">
                        <Link href={row.href} className="hover:underline">
                          {row.label}
                        </Link>
                      </TableCell>
                      <TableCell className="tabular-nums whitespace-normal">
                        {row.primary}{" "}
                        <span className="text-muted-foreground">
                          {row.primaryLabel}
                        </span>
                      </TableCell>
                      <TableCell className="tabular-nums whitespace-normal">
                        {row.secondary}{" "}
                        <span className="text-muted-foreground">
                          {row.secondaryLabel}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
