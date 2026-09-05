import { cache } from "react";

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
  "id, name, event_date, location, format, speakers, assets, outcomes, publish_status, created_at, updated_at" as const;

const STARTUP_OPTIONS_LIMIT = 500;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

function escapeIlikePattern(value: string): string {
  return value.replace(/[\\%_"]/g, "\\$&");
}

async function fetchEventsPage(
  supabase: ServerClient,
  query: EventListQuery,
): Promise<EventListResult> {
  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize - 1;

  let request = supabase
    .from("events")
    .select(LIST_COLUMNS, { count: "exact" })
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

  const rows = data ?? [];
  const eventIds = rows.map((row) => row.id);
  const startupIdsByEvent = new Map<string, string[]>();

  if (eventIds.length > 0) {
    const { data: links, error: linksError } = await supabase
      .from("event_startups")
      .select("event_id, startup_id")
      .in("event_id", eventIds);

    if (linksError) throw linksError;

    for (const link of links ?? []) {
      const existing = startupIdsByEvent.get(link.event_id) ?? [];
      existing.push(link.startup_id);
      startupIdsByEvent.set(link.event_id, existing);
    }
  }

  const total = count ?? 0;
  return {
    events: rows.map((row) => ({
      ...(row as Omit<EventListItem, "startup_ids">),
      startup_ids: startupIdsByEvent.get(row.id) ?? [],
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getEventsPageData(
  query: EventListQuery,
): Promise<
  { status: "forbidden" } | { status: "ok"; list: EventListResult }
> {
  const supabase = await createClient();

  const [adminResult, list] = await Promise.all([
    supabase.rpc("is_admin"),
    fetchEventsPage(supabase, query),
  ]);

  if (adminResult.error) throw adminResult.error;
  if (!adminResult.data) return { status: "forbidden" };

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
    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
    if (adminError) throw adminError;
    if (!isAdmin) return { status: "forbidden" };

    const [eventResult, linksResult] = await Promise.all([
      supabase.from("events").select(LIST_COLUMNS).eq("id", id).maybeSingle(),
      supabase
        .from("event_startups")
        .select("startup_id")
        .eq("event_id", id),
    ]);

    if (eventResult.error) throw eventResult.error;
    if (linksResult.error) throw linksResult.error;
    if (!eventResult.data) return { status: "not_found" };

    return {
      status: "ok",
      event: {
        ...(eventResult.data as EventListItem),
        startup_ids: (linksResult.data ?? []).map((row) => row.startup_id),
      },
    };
  },
);

/**
 * Admin picker options for linking startups to an event. Not cached across
 * requests — the set changes as portfolio CRUD runs.
 */
export async function getEventStartupOptions(): Promise<
  { status: "forbidden" } | { status: "ok"; options: EventStartupOption[] }
> {
  const supabase = await createClient();
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError) throw adminError;
  if (!isAdmin) return { status: "forbidden" };

  const { data, error } = await supabase
    .from("startups")
    .select("id, name")
    .order("name", { ascending: true })
    .limit(STARTUP_OPTIONS_LIMIT);

  if (error) throw error;

  return {
    status: "ok",
    options: (data ?? []) as EventStartupOption[],
  };
}
