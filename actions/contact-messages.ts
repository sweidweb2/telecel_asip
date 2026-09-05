"use server";

import { headers } from "next/headers";

import { getAdminResource } from "@/constants/admin-resources";
import {
  refreshAdminResource,
  runAdminMutation,
  type AdminActionResult,
} from "@/lib/admin/run-admin-mutation";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { isRateLimited, recordRateLimitHit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  TURNSTILE_CONTACT_ACTION,
  verifyTurnstileToken,
} from "@/lib/turnstile";
import {
  contactMessageSchemaFor,
  deleteContactMessageSchema,
  updateContactMessageSchema,
  type ContactMessageInput,
  type DeleteContactMessageInput,
  type UpdateContactMessageInput,
} from "@/validations/contact-message";

export type ContactMessageActionResult = AdminActionResult;

const resource = getAdminResource("contactUs");

/** Public marketing form copy (locale-aware). */
const PUBLIC_MESSAGES = {
  en: {
    invalidDetails: "Please check the form and try again.",
    success: "Thank you — your message has been sent.",
    genericError: "Something went wrong. Please try again.",
    rateLimited: "Too many submissions. Please wait and try again later.",
    verificationFailed: "Security check failed. Please try again.",
  },
  fr: {
    invalidDetails: "Veuillez vérifier le formulaire et réessayer.",
    success: "Merci — votre message a bien été envoyé.",
    genericError: "Une erreur s’est produite. Veuillez réessayer.",
    rateLimited:
      "Trop de soumissions. Veuillez patienter et réessayer plus tard.",
    verificationFailed:
      "La vérification de sécurité a échoué. Veuillez réessayer.",
  },
} as const;

/** Dashboard admin copy (English-only). */
const ADMIN_MESSAGES = {
  invalidDetails: "Please check the form and try again.",
  updateSuccess: "Message updated successfully.",
  deleteSuccess: "Message deleted successfully.",
  genericError: "Something went wrong. Please try again.",
  unauthorized: "You do not have permission to manage contact messages.",
  signedInRequired: "You must be signed in.",
  notFound: "Message not found.",
} as const;

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_PER_IP = 5;
const RATE_LIMIT_PER_EMAIL = 3;

async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headerStore.get("x-real-ip")?.trim() || "unknown";
}

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

  const ip = await getClientIp();
  const turnstileOk = await verifyTurnstileToken({
    token: turnstileToken,
    expectedAction: TURNSTILE_CONTACT_ACTION,
    remoteip: ip,
  });
  if (!turnstileOk) {
    return { status: "error", message: copy.verificationFailed };
  }

  const ipKey = `contact:ip:${ip}`;
  const emailKey = `contact:email:${email}`;

  if (
    isRateLimited(ipKey, RATE_LIMIT_PER_IP, RATE_LIMIT_WINDOW_MS) ||
    isRateLimited(emailKey, RATE_LIMIT_PER_EMAIL, RATE_LIMIT_WINDOW_MS)
  ) {
    return { status: "error", message: copy.rateLimited };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("contact_messages").insert({
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

  recordRateLimitHit(ipKey, RATE_LIMIT_WINDOW_MS);
  recordRateLimitHit(emailKey, RATE_LIMIT_WINDOW_MS);

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
