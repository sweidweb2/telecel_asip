import { unstable_cache } from "next/cache";

import { DASHBOARD_NAV_COUNTS_CACHE_TAG } from "@/constants/dashboard-nav-counts";
import { ROUTES } from "@/constants/routes";
import { gateEditorPageData } from "@/lib/admin/admin-list-query";
import { createAccessTokenClient } from "@/lib/supabase/editor-access-client";
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
  investorInterests: InboxPipelineStats;
  investorEngagements: InboxPipelineStats;
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
  investorInterests?: InboxPayload;
  investorEngagements?: InboxPayload;
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
      label: "Startups",
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

const ANALYTICS_REVALIDATE_SECONDS = 60;

/** Non-editor token. Thrown so a forbidden snapshot is not stored for the TTL. */
class AnalyticsForbiddenError extends Error {
  constructor() {
    super("get_admin_analytics is not allowed");
    this.name = "AnalyticsForbiddenError";
  }
}

function mapAnalyticsPayload(data: unknown): AdminAnalytics {
  const payload = (data ?? {}) as AnalyticsPayload & Json;
  return {
    applications: mapInbox(payload.applications),
    registrations: mapInbox(payload.registrations),
    investorInterests: mapInbox(payload.investorInterests),
    investorEngagements: mapInbox(payload.investorEngagements),
    contactMessages: mapInbox(payload.contactMessages),
    content: mapContent(payload.content),
  };
}

/**
 * Cookie-free read. The access token stays in the closure so every editor
 * shares one entry, busted by the same tag as the nav badges.
 */
async function fetchAdminAnalytics(accessToken: string): Promise<AdminAnalytics> {
  const supabase = createAccessTokenClient(accessToken);
  const { data, error } = await supabase.rpc("get_admin_analytics");

  if (error) {
    if (error.code === "42501") throw new AnalyticsForbiddenError();
    throw new Error(error.message);
  }

  return mapAnalyticsPayload(data);
}

function readCachedAdminAnalytics(
  accessToken: string,
): Promise<AdminAnalytics> {
  return unstable_cache(
    () => fetchAdminAnalytics(accessToken),
    ["admin-analytics"],
    {
      tags: [DASHBOARD_NAV_COUNTS_CACHE_TAG],
      revalidate: ANALYTICS_REVALIDATE_SECONDS,
    },
  )();
}

/**
 * CMS Analytics snapshot via `get_admin_analytics` (one DB round-trip).
 * Labels/hrefs stay in TS; RPC returns counts only.
 * Cached on the nav-count tag so home does not rescan those tables on every visit.
 */
export async function getAdminAnalytics(): Promise<
  { status: "forbidden" } | { status: "ok"; analytics: AdminAnalytics }
> {
  const gated = await gateEditorPageData(
    async (supabase) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) return { analytics: null };

      try {
        return { analytics: await readCachedAdminAnalytics(accessToken) };
      } catch (error) {
        if (error instanceof AnalyticsForbiddenError) return { analytics: null };
        throw error;
      }
    }
  );

  if (gated.status === "forbidden") return gated;
  if (!gated.analytics) return { status: "forbidden" };
  return { status: "ok", analytics: gated.analytics };
}
