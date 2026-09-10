"use server";

import { getAdminResource } from "@/constants/admin-resources";
import { authorizeEditor } from "@/lib/admin/authorize-editor";
import { emptyToNull } from "@/lib/admin/empty-to-null";
import { mapPgActionError } from "@/lib/admin/pg-action-error";
import {
  refreshAdminResource,
  runAdminMutation,
  type AdminActionResult,
} from "@/lib/admin/run-admin-mutation";
import {
  createEventSchema,
  deleteEventSchema,
  updateEventSchema,
  type CreateEventInput,
  type DeleteEventInput,
  type UpdateEventInput,
} from "@/validations/event";

export type EventActionResult = AdminActionResult;

const resource = getAdminResource("events");

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

const PG_MESSAGES = {
  unauthorized: MESSAGES.unauthorized,
  notFound: MESSAGES.notFound,
  genericError: MESSAGES.genericError,
};

function refreshEventPaths(eventId?: string) {
  refreshAdminResource({
    listPath: resource.listPath,
    detailPath: eventId ? `${resource.listPath}/${eventId}` : undefined,
    cacheTags: resource.cacheTags,
  });
}

function toEventJson(input: CreateEventInput | UpdateEventInput) {
  return {
    name: input.name,
    event_date: input.eventDate,
    location: emptyToNull(input.location) ?? "",
    format: input.format ?? "",
    speakers: input.speakers,
    assets: input.assets,
    outcomes: emptyToNull(input.outcomes) ?? "",
    publish_status: input.publishStatus,
  };
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

  const session = await authorizeEditor(MESSAGES);
  if (session.status === "error") return session;

  const { data, error } = await session.supabase.rpc("create_event_with_links", {
    p_event: toEventJson(parsed.data),
    p_startup_ids: parsed.data.startupIds,
  });

  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row?.id) {
    return {
      status: "error",
      message: mapPgActionError(error ?? {}, PG_MESSAGES),
    };
  }

  refreshEventPaths(row.id);
  return { status: "success", message: MESSAGES.createSuccess, id: row.id };
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

  const session = await authorizeEditor(MESSAGES);
  if (session.status === "error") return session;

  const { id, ...rest } = parsed.data;

  const { data, error } = await session.supabase.rpc("update_event_with_links", {
    p_id: id,
    p_event: toEventJson(rest),
    p_startup_ids: rest.startupIds,
  });

  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row?.id) {
    return {
      status: "error",
      message: mapPgActionError(error ?? {}, PG_MESSAGES),
    };
  }

  refreshEventPaths(row.id);
  return { status: "success", message: MESSAGES.updateSuccess, id: row.id };
}

export async function deleteEvent(
  input: DeleteEventInput,
): Promise<EventActionResult> {
  return runAdminMutation({
    schema: deleteEventSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.deleteSuccess,
    },
    pgMessages: PG_MESSAGES,
    execute: async (session, data) => {
      const { data: existing, error: existingError } = await session.supabase
        .from("events")
        .select("id")
        .eq("id", data.id)
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
        .eq("id", data.id);

      if (deleteError) {
        return { status: "error", pgError: deleteError };
      }
      return { status: "success" };
    },
    refresh: () => refreshEventPaths(),
  });
}
