"use server";

import { getAdminResource } from "@/constants/admin-resources";
import { logServerActionError } from "@/lib/admin/log-server-action-error";
import { refreshAdminResource } from "@/lib/admin/run-admin-mutation";
import type { AdminActionResult } from "@/types/admin-action";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  guardPublicFormSubmission,
  PUBLIC_SUBMIT_GUARD_COPY,
  runGuardedAdminWork,
} from "@/lib/intake/submit-guard";
import {
  contactMessageSchemaFor,
  type ContactMessageInput,
} from "@/validations/contact-message";

export type SubmitContactMessageResult = AdminActionResult;

const resource = getAdminResource("contactUs");

const MESSAGES = {
  en: {
    ...PUBLIC_SUBMIT_GUARD_COPY.en,
    success: "Thank you - your message has been sent.",
  },
  fr: {
    ...PUBLIC_SUBMIT_GUARD_COPY.fr,
    success: "Merci - votre message a bien été envoyé.",
  },
} as const;

export async function submitContactMessage(
  input: ContactMessageInput,
): Promise<SubmitContactMessageResult> {
  const locale = await getRequestLocale();
  const copy = MESSAGES[locale];
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
  } = parsed.data;

  const guard = await guardPublicFormSubmission({
    rateLimitPrefix: "contact",
    identityKind: "email",
    identity: email,
    messages: copy,
  });
  if (guard.status === "error") return guard;

  const { error } = await runGuardedAdminWork(guard, (admin) =>
    admin.from("contact_messages").insert({
      enquiry_type: enquiryType,
      full_name: fullName,
      email,
      phone,
      subject,
      message,
    }),
  );

  if (error) {
    logServerActionError("[contact-submit]", error, { kind: "insert_failed" });
    return { status: "error", message: copy.genericError };
  }

  refreshAdminResource({
    listPath: resource.listPath,
    cacheTags: resource.cacheTags,
    bustNavCounts: false,
  });
  return { status: "success", message: copy.success };
}
