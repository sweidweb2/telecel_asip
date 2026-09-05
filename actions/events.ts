"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { EVENTS_CACHE_TAG } from "@/data/events";
import { createClient } from "@/lib/supabase/server";
import {
  createEventSchema,
  deleteEventSchema,
  updateEventSchema,
  type CreateEventInput,
  type DeleteEventInput,
  type UpdateEventInput,
} from "@/validations/event";

export type EventActionResult =
  | { status: "success"; message: string; id?: string }
  | { status: "error"; message: string };

const MESSAGES = {
  unauthorized: "You do not have permission to manage events.",
  signedInRequired: "You must be signed in.",
  invalidDetails: "Please check the form and try again.",
  createSuccess: "Event created successfully.",
  updateSuccess: "Event updated successfully.",
  deleteSuccess: "Event deleted successfully.",
  notFound: "Event not found.",
  genericError: "Something went wrong. Please try again.",
} as const;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type AdminSession =
  | {
      status: "success";
      supabase: SupabaseServerClient;
    }
  | { status: "error"; message: string };

async function authorizeAdmin(): Promise<AdminSession> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { status: "error", message: MESSAGES.signedInRequired };
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) {
    return { status: "error", message: MESSAGES.unauthorized };
  }

  return { status: "success", supabase };
}

function refreshEventPaths(eventId?: string) {
  revalidateTag(EVENTS_CACHE_TAG, "max");
  revalidatePath(ROUTES.events);
  if (eventId) {
    revalidatePath(`${ROUTES.events}/${eventId}`);
  }
}

function emptyToNull(value: string | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toEventRow(input: CreateEventInput | UpdateEventInput) {
  return {
    name: input.name,
    event_date: input.eventDate,
    location: emptyToNull(input.location),
    format: input.format,
    speakers: input.speakers,
    assets: input.assets,
    outcomes: emptyToNull(input.outcomes),
    publish_status: input.publishStatus,
  };
}

function writeErrorMessage(error: { code?: string; message?: string }): string {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  if (code === "42501" || message.includes("not authorized")) {
    return MESSAGES.unauthorized;
  }
  if (code === "PGRST116" || message.includes("no rows")) {
    return MESSAGES.notFound;
  }
  return MESSAGES.genericError;
}

async function replaceEventStartups(
  supabase: SupabaseServerClient,
  eventId: string,
  startupIds: string[],
): Promise<{ status: "success" } | { status: "error"; message: string }> {
  const { data: existingLinks, error: existingError } = await supabase
    .from("event_startups")
    .select("startup_id")
    .eq("event_id", eventId);

  if (existingError) {
    return { status: "error", message: writeErrorMessage(existingError) };
  }

  const previousIds = (existingLinks ?? []).map((row) => row.startup_id);

  const { error: deleteError } = await supabase
    .from("event_startups")
    .delete()
    .eq("event_id", eventId);

  if (deleteError) {
    return { status: "error", message: writeErrorMessage(deleteError) };
  }

  const uniqueIds = [...new Set(startupIds)];

  if (uniqueIds.length === 0) {
    return { status: "success" };
  }

  const { error: insertError } = await supabase.from("event_startups").insert(
    uniqueIds.map((startup_id) => ({
      event_id: eventId,
      startup_id,
    })),
  );

  if (insertError) {
    if (previousIds.length > 0) {
      await supabase.from("event_startups").insert(
        previousIds.map((startup_id) => ({
          event_id: eventId,
          startup_id,
        })),
      );
    }
    return { status: "error", message: writeErrorMessage(insertError) };
  }

  return { status: "success" };
}

export async function createEvent(
  input: CreateEventInput,
): Promise<EventActionResult> {
  const parsed = createEventSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeAdmin();
  if (session.status === "error") return session;

  const { data, error } = await session.supabase
    .from("events")
    .insert(toEventRow(parsed.data))
    .select("id")
    .single();

  if (error || !data?.id) {
    return { status: "error", message: writeErrorMessage(error ?? {}) };
  }

  const links = await replaceEventStartups(
    session.supabase,
    data.id,
    parsed.data.startupIds,
  );
  if (links.status === "error") {
    await session.supabase.from("events").delete().eq("id", data.id);
    return links;
  }

  refreshEventPaths(data.id);
  return { status: "success", message: MESSAGES.createSuccess, id: data.id };
}

export async function updateEvent(
  input: UpdateEventInput,
): Promise<EventActionResult> {
  const parsed = updateEventSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeAdmin();
  if (session.status === "error") return session;

  const { data, error } = await session.supabase
    .from("events")
    .update(toEventRow(parsed.data))
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: writeErrorMessage(error) };
  }
  if (!data?.id) {
    return { status: "error", message: MESSAGES.notFound };
  }

  const links = await replaceEventStartups(
    session.supabase,
    data.id,
    parsed.data.startupIds,
  );
  if (links.status === "error") {
    return links;
  }

  refreshEventPaths(data.id);
  return { status: "success", message: MESSAGES.updateSuccess, id: data.id };
}

export async function deleteEvent(
  input: DeleteEventInput,
): Promise<EventActionResult> {
  const parsed = deleteEventSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const session = await authorizeAdmin();
  if (session.status === "error") return session;

  const { data: existing, error: existingError } = await session.supabase
    .from("events")
    .select("id")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (existingError) {
    return { status: "error", message: MESSAGES.genericError };
  }
  if (!existing) {
    return { status: "error", message: MESSAGES.notFound };
  }

  const { error: deleteError } = await session.supabase
    .from("events")
    .delete()
    .eq("id", parsed.data.id);

  if (deleteError) {
    return { status: "error", message: writeErrorMessage(deleteError) };
  }

  refreshEventPaths();
  return { status: "success", message: MESSAGES.deleteSuccess };
}
