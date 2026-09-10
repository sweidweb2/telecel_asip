import { cache } from "react";
import { unstable_cache } from "next/cache";

import { format } from "date-fns";

import {
  adminListRange,
  adminListTotalPages,
} from "@/lib/admin/admin-list-query";
import { countExact } from "@/lib/admin/count-exact";
import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { isCurrentUserEditor } from "@/lib/admin/is-current-user-editor";
import { wrapCached, traceAsync } from "@/lib/admin/perf";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type {
  EventDetail,
  EventListItem,
  EventListResult,
  EventPublicListItem,
  EventStartupOption,
} from "@/types/event";
import { eventIdSchema, type EventListQuery } from "@/validations/event";

export const EVENTS_CACHE_TAG = "events";

const LIST_COLUMNS =
  "id, name, event_date, location, format, publish_status, created_at, updated_at" as const;

const DETAIL_COLUMNS =
  "id, name, event_date, location, format, speakers, assets, outcomes, publish_status, created_at, updated_at" as const;

const PUBLIC_LIST_COLUMNS =
  "id, name, event_date, location, format, speakers, outcomes, updated_at" as const;

const STARTUP_OPTIONS_LIMIT = 100;

/** Cap junction id loads on detail so a bad dataset cannot unbounded-read. */
const DETAIL_LINK_LIMIT = 200;

/** Cap public published list so anon reads stay bounded. */
const PUBLIC_LIMIT = 200;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchEventsPage(
  supabase: ServerClient,
  query: EventListQuery,
): Promise<EventListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("events")
    .select(LIST_COLUMNS, { count: "estimated" })
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (query.status !== "all") {
    request = request.eq("publish_status", query.status);
  }

  if (query.search) {
    const pattern = escapeIlikePattern(query.search);
    request = request.ilike("name", `%${pattern}%`);
  }

  const { data, count, error } = await request;
  if (error) throw error;

  const total = count ?? 0;
  return {
    events: (data ?? []) as EventListItem[],
    total,
    totalPages: adminListTotalPages(total, query.pageSize),
  };
}

export type EventListStats = {
  total: number;
  published: number;
  draft: number;
  upcoming: number;
};

async function fetchEventListStats(
  supabase: ServerClient,
): Promise<EventListStats> {
  const today = format(new Date(), "yyyy-MM-dd");

  const [total, published, draft, upcoming] = await Promise.all([
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("publish_status", "published"),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("publish_status", "draft"),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .gte("event_date", today),
  ]);

  return {
    total: countExact(total),
    published: countExact(published),
    draft: countExact(draft),
    upcoming: countExact(upcoming),
  };
}

export async function getEventsPageData(
  query: EventListQuery,
): Promise<
  | { status: "forbidden" }
  | { status: "ok"; list: EventListResult; stats: EventListStats }
> {
  return traceAsync(
    "getEventsPageData",
    { eventType: "data_read", cacheStatus: "n_a" },
    async () => {
      const supabase = await createClient();

      const [isAdmin, list, stats] = await Promise.all([
        isCurrentUserEditor(),
        fetchEventsPage(supabase, query),
        fetchEventListStats(supabase),
      ]);

      if (!isAdmin) return { status: "forbidden" };

      return { status: "ok", list, stats };
    },
  );
}

type EventDetailResult =
  | { status: "forbidden" }
  | { status: "not_found" }
  | { status: "ok"; event: EventDetail };

export const getEventByIdForAdmin = wrapCached(
  "getEventByIdForAdmin",
  { eventType: "data_read" },
  cache(
    async (id: string): Promise<EventDetailResult> => {
      if (!eventIdSchema.safeParse(id).success) return { status: "not_found" };

      const supabase = await createClient();
      if (!(await isCurrentUserEditor())) return { status: "forbidden" };

      const [eventResult, linksResult] = await Promise.all([
        supabase
          .from("events")
          .select(DETAIL_COLUMNS)
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("event_startups")
          .select("startup_id, startups(id, name)")
          .eq("event_id", id)
          .limit(DETAIL_LINK_LIMIT),
      ]);

      if (eventResult.error) throw eventResult.error;
      if (linksResult.error) throw linksResult.error;
      if (!eventResult.data) return { status: "not_found" };

      const linked_startups: EventStartupOption[] = [];
      const startup_ids: string[] = [];
      for (const row of linksResult.data ?? []) {
        startup_ids.push(row.startup_id);
        const startup = row.startups as
          | EventStartupOption
          | EventStartupOption[]
          | null;
        const named = Array.isArray(startup) ? startup[0] : startup;
        if (named?.id && named.name) {
          linked_startups.push({ id: named.id, name: named.name });
        }
      }

      return {
        status: "ok",
        event: {
          ...(eventResult.data as Omit<
            EventDetail,
            "startup_ids" | "linked_startups"
          >),
          startup_ids,
          linked_startups,
        },
      };
    },
  ),
);

/**
 * Admin picker options for linking startups to an event. Not cached across
 * requests — the set changes as portfolio CRUD runs.
 */
export async function getEventStartupOptions(
  search = "",
  includeIds: string[] = [],
): Promise<
  { status: "forbidden" } | { status: "ok"; options: EventStartupOption[] }
> {
  return traceAsync(
    "getEventStartupOptions",
    { eventType: "option_load", cacheStatus: "n_a" },
    async () => {
      const supabase = await createClient();
      if (!(await isCurrentUserEditor())) return { status: "forbidden" };

      const term = search.trim().slice(0, 100);
      let request = supabase
        .from("startups")
        .select("id, name")
        .order("name", { ascending: true })
        .limit(STARTUP_OPTIONS_LIMIT);

      if (term) {
        const pattern = escapeIlikePattern(term);
        request = request.ilike("name", `%${pattern}%`);
      }

      const { data, error } = await request;
      if (error) throw error;

      let options = (data ?? []) as EventStartupOption[];
      const missingIds = includeIds.filter(
        (id) => id && !options.some((row) => row.id === id),
      );
      if (missingIds.length > 0) {
        const included = await supabase
          .from("startups")
          .select("id, name")
          .in("id", missingIds)
          .limit(STARTUP_OPTIONS_LIMIT);
        if (included.error) throw included.error;
        options = [
          ...((included.data ?? []) as EventStartupOption[]),
          ...options,
        ];
      }

      return {
        status: "ok",
        options,
      };
    },
  );
}

async function fetchPublishedEvents(): Promise<EventPublicListItem[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select(PUBLIC_LIST_COLUMNS)
    .eq("publish_status", "published")
    .order("event_date", { ascending: false })
    .limit(PUBLIC_LIMIT);

  if (error) throw error;
  return (data ?? []) as EventPublicListItem[];
}

/** Cached published events for when a marketing surface is wired. */
export const getPublishedEvents = unstable_cache(
  fetchPublishedEvents,
  ["published-events"],
  { tags: [EVENTS_CACHE_TAG], revalidate: 300 },
);
