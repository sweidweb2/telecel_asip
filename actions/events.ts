"use server";

import { getAdminResource } from "@/constants/admin-resources";
import { emptyToNull } from "@/lib/admin/empty-to-null";
import { mapPgActionError } from "@/lib/admin/pg-action-error";
import {
  refreshAdminResource,
  runAdminMutation
} from "@/lib/admin/run-admin-mutation";
import type { AdminActionResult } from "@/types/admin-action";
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
  return runAdminMutation({
    schema: createEventSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.createSuccess,
    },
    perfName: "createEvent",
    execute: async (session, data) => {
      const { data: rpcData, error } = await session.supabase.rpc(
        "create_event_with_links",
        {
          p_event: toEventJson(data),
          p_startup_ids: data.startupIds,
        },
      );

      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (error || !row?.id) {
        return {
          status: "error",
          message: mapPgActionError(error ?? {}, PG_MESSAGES),
        };
      }
      return { status: "success", id: row.id };
    },
    refresh: (_data, id) => refreshEventPaths(id),
  });
}

export async function updateEvent(
  input: UpdateEventInput,
): Promise<EventActionResult> {
  return runAdminMutation({
    schema: updateEventSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.updateSuccess,
    },
    perfName: "updateEvent",
    execute: async (session, data) => {
      const { id, ...rest } = data;

      const { data: rpcData, error } = await session.supabase.rpc(
        "update_event_with_links",
        {
          p_id: id,
          p_event: toEventJson(rest),
          p_startup_ids: rest.startupIds,
        },
      );

      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (error || !row?.id) {
        return {
          status: "error",
          message: mapPgActionError(error ?? {}, PG_MESSAGES),
        };
      }
      return { status: "success", id: row.id };
    },
    refresh: (_data, id) => refreshEventPaths(id),
  });
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
