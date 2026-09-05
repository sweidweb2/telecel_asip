import { cache } from "react";

import {
  adminListRange,
  adminListTotalPages,
} from "@/lib/admin/admin-list-query";
import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
import { createClient } from "@/lib/supabase/server";
import type {
  EventDetail,
  EventListItem,
  EventListResult,
  EventStartupOption,
} from "@/types/event";
import { eventIdSchema, type EventListQuery } from "@/validations/event";

export const EVENTS_CACHE_TAG = "events";

const LIST_COLUMNS =
  "id, name, event_date, location, format, publish_status, created_at, updated_at" as const;

const DETAIL_COLUMNS =
  "id, name, event_date, location, format, speakers, assets, outcomes, publish_status, created_at, updated_at" as const;

const STARTUP_OPTIONS_LIMIT = 100;

/** Cap junction id loads on detail so a bad dataset cannot unbounded-read. */
const DETAIL_LINK_LIMIT = 500;

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

export async function getEventsPageData(
  query: EventListQuery,
): Promise<
  { status: "forbidden" } | { status: "ok"; list: EventListResult }
> {
  const supabase = await createClient();

  const [isAdmin, list] = await Promise.all([
    isCurrentUserAdmin(),
    fetchEventsPage(supabase, query),
  ]);

  if (!isAdmin) return { status: "forbidden" };

  return { status: "ok", list };
}

type EventDetailResult =
  | { status: "forbidden" }
  | { status: "not_found" }
  | { status: "ok"; event: EventDetail };

export const getEventByIdForAdmin = cache(
  async (id: string): Promise<EventDetailResult> => {
    if (!eventIdSchema.safeParse(id).success) return { status: "not_found" };

    const supabase = await createClient();
    if (!(await isCurrentUserAdmin())) return { status: "forbidden" };

    const [eventResult, linksResult] = await Promise.all([
      supabase.from("events").select(DETAIL_COLUMNS).eq("id", id).maybeSingle(),
      supabase
        .from("event_startups")
        .select("startup_id")
        .eq("event_id", id)
        .limit(DETAIL_LINK_LIMIT),
    ]);

    if (eventResult.error) throw eventResult.error;
    if (linksResult.error) throw linksResult.error;
    if (!eventResult.data) return { status: "not_found" };

    return {
      status: "ok",
      event: {
        ...(eventResult.data as Omit<EventDetail, "startup_ids">),
        startup_ids: (linksResult.data ?? []).map((row) => row.startup_id),
      },
    };
  },
);

/**
 * Admin picker options for linking startups to an event. Not cached across
 * requests — the set changes as portfolio CRUD runs.
 */
export async function getEventStartupOptions(
  search = "",
): Promise<
  { status: "forbidden" } | { status: "ok"; options: EventStartupOption[] }
> {
  const supabase = await createClient();
  if (!(await isCurrentUserAdmin())) return { status: "forbidden" };

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

  return {
    status: "ok",
    options: (data ?? []) as EventStartupOption[],
  };
}
