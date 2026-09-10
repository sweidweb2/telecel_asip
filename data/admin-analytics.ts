import { ROUTES } from "@/constants/routes";
import { isCurrentUserEditor } from "@/lib/admin/is-current-user-editor";
import { traceAsync } from "@/lib/admin/perf";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

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

type InboxPayload = {
  total?: number;
  unread?: number;
  reviewed?: number;
  archived?: number;
  last7Days?: number;
  last30Days?: number;
};

type ContentPayload = {
  blogsPublished?: number;
  blogsDraft?: number;
  startupsActive?: number;
  startupsOther?: number;
  partnersActive?: number;
  partnersHistorical?: number;
  cohortsPublished?: number;
  cohortsDraft?: number;
  eventsPublished?: number;
  eventsDraft?: number;
  storiesPublished?: number;
  storiesDraft?: number;
  metricsVerified?: number;
  metricsOther?: number;
};

type AnalyticsPayload = {
  applications?: InboxPayload;
  registrations?: InboxPayload;
  contactMessages?: InboxPayload;
  content?: ContentPayload;
};

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function mapInbox(payload: InboxPayload | undefined): InboxPipelineStats {
  return {
    total: asNumber(payload?.total),
    unread: asNumber(payload?.unread),
    reviewed: asNumber(payload?.reviewed),
    archived: asNumber(payload?.archived),
    last7Days: asNumber(payload?.last7Days),
    last30Days: asNumber(payload?.last30Days),
  };
}

function mapContent(payload: ContentPayload | undefined): ContentSnapshotRow[] {
  return [
    {
      label: "Blogs",
      href: ROUTES.blogs,
      primary: asNumber(payload?.blogsPublished),
      primaryLabel: "Published",
      secondary: asNumber(payload?.blogsDraft),
      secondaryLabel: "Draft",
    },
    {
      label: "Startup",
      href: ROUTES.portfolio,
      primary: asNumber(payload?.startupsActive),
      primaryLabel: "Active",
      secondary: asNumber(payload?.startupsOther),
      secondaryLabel: "Draft / inactive",
    },
    {
      label: "Partners",
      href: ROUTES.partners,
      primary: asNumber(payload?.partnersActive),
      primaryLabel: "Active",
      secondary: asNumber(payload?.partnersHistorical),
      secondaryLabel: "Historical",
    },
    {
      label: "Cohorts",
      href: ROUTES.cohorts,
      primary: asNumber(payload?.cohortsPublished),
      primaryLabel: "Published",
      secondary: asNumber(payload?.cohortsDraft),
      secondaryLabel: "Draft",
    },
    {
      label: "Events",
      href: ROUTES.events,
      primary: asNumber(payload?.eventsPublished),
      primaryLabel: "Published",
      secondary: asNumber(payload?.eventsDraft),
      secondaryLabel: "Draft",
    },
    {
      label: "Founder stories",
      href: ROUTES.founderStories,
      primary: asNumber(payload?.storiesPublished),
      primaryLabel: "Published",
      secondary: asNumber(payload?.storiesDraft),
      secondaryLabel: "Draft",
    },
    {
      label: "Impact metrics",
      href: ROUTES.impactMetrics,
      primary: asNumber(payload?.metricsVerified),
      primaryLabel: "Verified",
      secondary: asNumber(payload?.metricsOther),
      secondaryLabel: "Other",
    },
  ];
}

/**
 * CMS Analytics snapshot via `get_admin_analytics` (one DB round-trip).
 * Labels/hrefs stay in TS; RPC returns counts only.
 */
export async function getAdminAnalytics(): Promise<
  { status: "forbidden" } | { status: "ok"; analytics: AdminAnalytics }
> {
  return traceAsync(
    "getAdminAnalytics",
    { eventType: "data_read", cacheStatus: "n_a" },
    async () => {
      if (!(await isCurrentUserEditor())) return { status: "forbidden" };

      const supabase = await createClient();
      const { data, error } = await supabase.rpc("get_admin_analytics");

      if (error) {
        if (error.code === "42501") return { status: "forbidden" };
        throw error;
      }

      const payload = (data ?? {}) as AnalyticsPayload & Json;

      return {
        status: "ok",
        analytics: {
          applications: mapInbox(payload.applications),
          registrations: mapInbox(payload.registrations),
          contactMessages: mapInbox(payload.contactMessages),
          content: mapContent(payload.content),
        },
      };
    },
  );
}
