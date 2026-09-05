import { subDays } from "date-fns";

import { ROUTES } from "@/constants/routes";
import { gateAdminPageData } from "@/lib/admin/admin-list-query";
import { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export type InboxPipelineStats = {
  total: number;
  unread: number;
  reviewed: number;
  archived: number;
  last7Days: number;
  last30Days: number;
};

export type ContentSnapshotRow = {
  label: string;
  href: string;
  primary: number;
  primaryLabel: string;
  secondary: number;
  secondaryLabel: string;
};

export type AdminAnalytics = {
  applications: InboxPipelineStats;
  registrations: InboxPipelineStats;
  contactMessages: InboxPipelineStats;
  content: ContentSnapshotRow[];
};

type AnalyticsTable =
  | "applications"
  | "interest_registrations"
  | "contact_messages"
  | "blogs"
  | "startups"
  | "partners"
  | "cohorts"
  | "events"
  | "founder_stories"
  | "impact_metrics";

type HeadCountBuilder = {
  eq: (column: string, value: string | boolean) => HeadCountBuilder;
  neq: (column: string, value: string) => HeadCountBuilder;
  gte: (column: string, value: string) => HeadCountBuilder;
};

async function countRows(
  supabase: ServerClient,
  table: AnalyticsTable,
  filter?: (query: HeadCountBuilder) => HeadCountBuilder,
): Promise<number> {
  const base = supabase
    .from(table)
    .select("id", { count: "exact", head: true }) as unknown as HeadCountBuilder;

  const query = filter ? filter(base) : base;
  const { count, error } = await (query as unknown as PromiseLike<{
    count: number | null;
    error: { message?: string; code?: string } | null;
  }>);

  if (error) {
    throw new Error(
      `Analytics count failed on ${table}: ${error.message || error.code || "unknown error"}`,
    );
  }

  return count ?? 0;
}

async function inboxStats(
  supabase: ServerClient,
  table: "applications" | "interest_registrations" | "contact_messages",
): Promise<InboxPipelineStats> {
  const since7 = subDays(new Date(), 7).toISOString();
  const since30 = subDays(new Date(), 30).toISOString();

  const [total, unread, reviewed, archived, last7Days, last30Days] =
    await Promise.all([
      countRows(supabase, table),
      countRows(supabase, table, (q) => q.eq("inbox_status", "unread")),
      countRows(supabase, table, (q) => q.eq("inbox_status", "reviewed")),
      countRows(supabase, table, (q) => q.eq("inbox_status", "archived")),
      countRows(supabase, table, (q) => q.gte("created_at", since7)),
      countRows(supabase, table, (q) => q.gte("created_at", since30)),
    ]);

  return { total, unread, reviewed, archived, last7Days, last30Days };
}

async function fetchContentSnapshot(
  supabase: ServerClient,
): Promise<ContentSnapshotRow[]> {
  const [
    blogsPublished,
    blogsDraft,
    startupsActive,
    startupsOther,
    partnersActive,
    partnersHistorical,
    cohortsPublished,
    cohortsDraft,
    eventsPublished,
    eventsDraft,
    storiesPublished,
    storiesDraft,
    metricsVerified,
    metricsOther,
  ] = await Promise.all([
    countRows(supabase, "blogs", (q) => q.eq("status", "published")),
    countRows(supabase, "blogs", (q) => q.eq("status", "draft")),
    countRows(supabase, "startups", (q) => q.eq("status", "active")),
    countRows(supabase, "startups", (q) => q.neq("status", "active")),
    countRows(supabase, "partners", (q) => q.eq("is_active", true)),
    countRows(supabase, "partners", (q) => q.eq("is_active", false)),
    countRows(supabase, "cohorts", (q) => q.eq("publish_status", "published")),
    countRows(supabase, "cohorts", (q) => q.eq("publish_status", "draft")),
    countRows(supabase, "events", (q) => q.eq("publish_status", "published")),
    countRows(supabase, "events", (q) => q.eq("publish_status", "draft")),
    countRows(supabase, "founder_stories", (q) =>
      q.eq("publish_status", "published"),
    ),
    countRows(supabase, "founder_stories", (q) =>
      q.eq("publish_status", "draft"),
    ),
    // impact_metrics.publish_status is evidence_status (verified/pending/…), not draft/published
    countRows(supabase, "impact_metrics", (q) =>
      q.eq("publish_status", "verified"),
    ),
    countRows(supabase, "impact_metrics", (q) =>
      q.neq("publish_status", "verified"),
    ),
  ]);

  return [
    {
      label: "Blogs",
      href: ROUTES.blogs,
      primary: blogsPublished,
      primaryLabel: "Published",
      secondary: blogsDraft,
      secondaryLabel: "Draft",
    },
    {
      label: "Portfolio",
      href: ROUTES.portfolio,
      primary: startupsActive,
      primaryLabel: "Active",
      secondary: startupsOther,
      secondaryLabel: "Draft / inactive",
    },
    {
      label: "Partners",
      href: ROUTES.partners,
      primary: partnersActive,
      primaryLabel: "Active",
      secondary: partnersHistorical,
      secondaryLabel: "Historical",
    },
    {
      label: "Cohorts",
      href: ROUTES.cohorts,
      primary: cohortsPublished,
      primaryLabel: "Published",
      secondary: cohortsDraft,
      secondaryLabel: "Draft",
    },
    {
      label: "Events",
      href: ROUTES.events,
      primary: eventsPublished,
      primaryLabel: "Published",
      secondary: eventsDraft,
      secondaryLabel: "Draft",
    },
    {
      label: "Founder stories",
      href: ROUTES.founderStories,
      primary: storiesPublished,
      primaryLabel: "Published",
      secondary: storiesDraft,
      secondaryLabel: "Draft",
    },
    {
      label: "Impact metrics",
      href: ROUTES.impactMetrics,
      primary: metricsVerified,
      primaryLabel: "Verified",
      secondary: metricsOther,
      secondaryLabel: "Other",
    },
  ];
}

export async function getAdminAnalytics(): Promise<
  { status: "forbidden" } | { status: "ok"; analytics: AdminAnalytics }
> {
  return gateAdminPageData(
    async (supabase) => {
      const [applications, registrations, contactMessages, content] =
        await Promise.all([
          inboxStats(supabase, "applications"),
          inboxStats(supabase, "interest_registrations"),
          inboxStats(supabase, "contact_messages"),
          fetchContentSnapshot(supabase),
        ]);

      return {
        analytics: {
          applications,
          registrations,
          contactMessages,
          content,
        },
      };
    },
    { name: "getAdminAnalytics" },
  );
}
