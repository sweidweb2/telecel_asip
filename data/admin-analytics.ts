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

type HeadCountQuery = {
  eq: (column: string, value: string | boolean) => HeadCountQuery;
  neq: (column: string, value: string) => HeadCountQuery;
  gte: (column: string, value: string) => HeadCountQuery;
  then: Promise<{ count: number | null; error: { message: string } | null }>["then"];
};

function headCount(
  supabase: ServerClient,
  table:
    | "applications"
    | "interest_registrations"
    | "contact_messages"
    | "blogs"
    | "startups"
    | "partners"
    | "cohorts"
    | "events"
    | "founder_stories"
    | "impact_metrics",
): HeadCountQuery {
  return supabase.from(table).select("id", {
    count: "exact",
    head: true,
  }) as unknown as HeadCountQuery;
}

async function countFiltered(
  query: HeadCountQuery,
): Promise<number> {
  const { count, error } = await query;
  if (error) throw error;
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
      countFiltered(headCount(supabase, table)),
      countFiltered(headCount(supabase, table).eq("inbox_status", "unread")),
      countFiltered(headCount(supabase, table).eq("inbox_status", "reviewed")),
      countFiltered(headCount(supabase, table).eq("inbox_status", "archived")),
      countFiltered(headCount(supabase, table).gte("created_at", since7)),
      countFiltered(headCount(supabase, table).gte("created_at", since30)),
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
    metricsPublished,
    metricsDraft,
  ] = await Promise.all([
    countFiltered(headCount(supabase, "blogs").eq("status", "published")),
    countFiltered(headCount(supabase, "blogs").eq("status", "draft")),
    countFiltered(headCount(supabase, "startups").eq("status", "active")),
    countFiltered(headCount(supabase, "startups").neq("status", "active")),
    countFiltered(headCount(supabase, "partners").eq("is_active", true)),
    countFiltered(headCount(supabase, "partners").eq("is_active", false)),
    countFiltered(
      headCount(supabase, "cohorts").eq("publish_status", "published"),
    ),
    countFiltered(headCount(supabase, "cohorts").eq("publish_status", "draft")),
    countFiltered(
      headCount(supabase, "events").eq("publish_status", "published"),
    ),
    countFiltered(headCount(supabase, "events").eq("publish_status", "draft")),
    countFiltered(
      headCount(supabase, "founder_stories").eq("publish_status", "published"),
    ),
    countFiltered(
      headCount(supabase, "founder_stories").eq("publish_status", "draft"),
    ),
    countFiltered(
      headCount(supabase, "impact_metrics").eq("publish_status", "published"),
    ),
    countFiltered(
      headCount(supabase, "impact_metrics").eq("publish_status", "draft"),
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
      primary: metricsPublished,
      primaryLabel: "Published",
      secondary: metricsDraft,
      secondaryLabel: "Draft",
    },
  ];
}

export async function getAdminAnalytics(): Promise<
  { status: "forbidden" } | { status: "ok"; analytics: AdminAnalytics }
> {
  return gateAdminPageData(async (supabase) => {
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
  });
}
