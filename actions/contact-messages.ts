"use server";

import { getAdminResource } from "@/constants/admin-resources";
import { getContactMessageById } from "@/data/contact-messages";
import {
  refreshAdminResource,
  runAdminMutation,
  type AdminActionResult,
} from "@/lib/admin/run-admin-mutation";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  guardPublicFormSubmission,
  PUBLIC_SUBMIT_GUARD_COPY,
} from "@/lib/intake/submit-guard";
import { TURNSTILE_CONTACT_ACTION } from "@/lib/turnstile";
import {
  contactMessageSchemaFor,
  deleteContactMessageSchema,
  updateContactMessageSchema,
  type ContactMessageInput,
  type DeleteContactMessageInput,
  type UpdateContactMessageInput,
} from "@/validations/contact-message";
import {
  updateInboxStatusSchema,
  type UpdateInboxStatusInput,
} from "@/validations/inbox";

export type ContactMessageActionResult = AdminActionResult;

const resource = getAdminResource("contactUs");

/** Public marketing form copy (locale-aware). */
const PUBLIC_MESSAGES = {
  en: {
    ...PUBLIC_SUBMIT_GUARD_COPY.en,
    success: "Thank you - your message has been sent.",
  },
  fr: {
    ...PUBLIC_SUBMIT_GUARD_COPY.fr,
    success: "Merci - votre message a bien été envoyé.",
  },
} as const;

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
  refreshAdminResource({ listPath: resource.listPath });
}

export async function submitContactMessage(
  input: ContactMessageInput,
): Promise<ContactMessageActionResult> {
  const locale = await getRequestLocale();
  const copy = PUBLIC_MESSAGES[locale];
  const parsed = contactMessageSchemaFor(locale).safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? copy.invalidDetails,
    };
  }

  const {
    enquiryType,
    fullName,
    email,
    phone,
    subject,
    message,
    turnstileToken,
  } = parsed.data;

  const guard = await guardPublicFormSubmission({
    turnstileToken,
    expectedAction: TURNSTILE_CONTACT_ACTION,
    rateLimitPrefix: "contact",
    identityKind: "email",
    identity: email,
    messages: copy,
  });
  if (guard.status === "error") return guard;

  const { error } = await guard.admin.from("contact_messages").insert({
    enquiry_type: enquiryType,
    full_name: fullName,
    email,
    phone,
    subject,
    message,
  });

  if (error) {
    return { status: "error", message: copy.genericError };
  }

  refreshContactUsRoute();
  return { status: "success", message: copy.success };
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
        return { status: "error", message: ADMIN_MESSAGES.genericError };
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
        return { status: "error", message: ADMIN_MESSAGES.genericError };
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
  return runAdminMutation({
    schema: updateInboxStatusSchema,
    input,
    messages: {
      ...ADMIN_MESSAGES,
      success: ADMIN_MESSAGES.inboxStatusSuccess,
    },
    execute: async (session, data) => {
      const { data: row, error } = await session.supabase
        .from("contact_messages")
        .update({ inbox_status: data.inboxStatus })
        .eq("id", data.id)
        .select("id")
        .maybeSingle();

      if (error) {
        return { status: "error", message: ADMIN_MESSAGES.genericError };
      }
      if (!row) {
        return { status: "error", message: ADMIN_MESSAGES.notFound };
      }
      return { status: "success" };
    },
    refresh: () => refreshContactUsRoute(),
  });
}

/** Full contact message for the shared inbox view/edit dialog. */
export async function loadContactMessage(id: string) {
  return getContactMessageById(id);
}
