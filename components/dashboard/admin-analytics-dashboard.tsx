import Link from "next/link";

import type {
  AdminAnalytics,
  InboxPipelineStats,
} from "@/data/admin-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          <Link href={href} className="hover:underline">
            {title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <Stat label="Total" value={stats.total} />
        <Stat label="Unread" value={stats.unread} />
        <Stat label="Reviewed" value={stats.reviewed} />
        <Stat label="Archived" value={stats.archived} />
        <Stat label="Last 7 days" value={stats.last7Days} />
        <Stat label="Last 30 days" value={stats.last30Days} />
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums tracking-tight">
        {value}
      </p>
    </div>
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
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Pipeline
        </h2>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
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
            title="Contact messages"
            href={ROUTES.contactUs}
            stats={analytics.contactMessages}
          />
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Content
        </h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="border-b bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Section</th>
                <th className="px-4 py-3 font-medium">Primary</th>
                <th className="px-4 py-3 font-medium">Secondary</th>
              </tr>
            </thead>
            <tbody>
              {analytics.content.map((row) => (
                <tr key={row.href} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">
                    <Link href={row.href} className="hover:underline">
                      {row.label}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {row.primary}{" "}
                    <span className="text-muted-foreground">
                      {row.primaryLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {row.secondary}{" "}
                    <span className="text-muted-foreground">
                      {row.secondaryLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
