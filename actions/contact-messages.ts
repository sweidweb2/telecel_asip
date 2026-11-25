"use server";

import { getAdminResource } from "@/constants/admin-resources";
import { getContactMessageById } from "@/data/contact-messages";
import {
  refreshAdminResource,
  runAdminMutation
} from "@/lib/admin/run-admin-mutation";
import type { AdminActionResult } from "@/types/admin-action";
import { runInboxStatusMutation } from "@/lib/admin/run-inbox-status-mutation";
import {
  deleteContactMessageSchema,
  updateContactMessageSchema,
  type DeleteContactMessageInput,
  type UpdateContactMessageInput,
} from "@/validations/contact-message";
import { type UpdateInboxStatusInput } from "@/validations/inbox";

export type ContactMessageActionResult = AdminActionResult;

const resource = getAdminResource("contactUs");

/** Dashboard admin copy (English-only). */
const ADMIN_MESSAGES = {
  invalidDetails: "Please check the form and try again.",
  updateSuccess: "Message updated successfully.",
  deleteSuccess: "Message deleted successfully.",
  inboxStatusSuccess: "Inbox status updated.",
  genericError: "Something went wrong. Please try again.",
  unauthorized: "You do not have permission to manage contact messages.",
  signedInRequired: "You must be signed in.",
  notFound: "Message not found.",
} as const;

function refreshContactUsRoute() {
  refreshAdminResource({
    listPath: resource.listPath,
    cacheTags: resource.cacheTags,
  });
}

export async function updateContactMessage(
  input: UpdateContactMessageInput,
): Promise<ContactMessageActionResult> {
  return runAdminMutation({
    schema: updateContactMessageSchema,
    input,
    messages: {
      ...ADMIN_MESSAGES,
      success: ADMIN_MESSAGES.updateSuccess,
    },
    execute: async (session, data) => {
      const { data: row, error } = await session.supabase
        .from("contact_messages")
        .update({
          enquiry_type: data.enquiryType,
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
        })
        .eq("id", data.id)
        .select("id")
        .maybeSingle();

      if (error) {
        return { status: "error", message: ADMIN_MESSAGES.genericError, pgError: error };
      }
      if (!row) {
        return { status: "error", message: ADMIN_MESSAGES.notFound };
      }
      return { status: "success" };
    },
    refresh: () => refreshContactUsRoute(),
  });
}

export async function deleteContactMessage(
  input: DeleteContactMessageInput,
): Promise<ContactMessageActionResult> {
  return runAdminMutation({
    schema: deleteContactMessageSchema,
    input,
    messages: {
      ...ADMIN_MESSAGES,
      success: ADMIN_MESSAGES.deleteSuccess,
    },
    execute: async (session, data) => {
      const { data: row, error } = await session.supabase
        .from("contact_messages")
        .delete()
        .eq("id", data.id)
        .select("id")
        .maybeSingle();

      if (error) {
        return { status: "error", message: ADMIN_MESSAGES.genericError, pgError: error };
      }
      if (!row) {
        return { status: "error", message: ADMIN_MESSAGES.notFound };
      }
      return { status: "success" };
    },
    refresh: () => refreshContactUsRoute(),
  });
}

export async function updateContactMessageInboxStatus(
  input: UpdateInboxStatusInput,
): Promise<ContactMessageActionResult> {
  return runInboxStatusMutation({
    table: "contact_messages",
    input,
    messages: {
      ...ADMIN_MESSAGES,
      success: ADMIN_MESSAGES.inboxStatusSuccess,
    },
    refresh: () => refreshContactUsRoute(),
  });
}

/** Full contact message for the shared inbox view/edit dialog. */
export async function loadContactMessage(id: string) {
  return getContactMessageById(id);
}
