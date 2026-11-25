"use server";

import { getNewsletterSignupEnabled } from "@/data/settings";
import { logServerActionError } from "@/lib/admin/log-server-action-error";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  guardPublicFormSubmission,
  PUBLIC_SUBMIT_GUARD_COPY,
  runGuardedAdminWork,
} from "@/lib/intake/submit-guard";
import {
  newsletterSubscribeSchema,
  type NewsletterSubscribeInput,
} from "@/validations/newsletter";

export type NewsletterActionResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const PUBLIC_MESSAGES = {
  en: {
    ...PUBLIC_SUBMIT_GUARD_COPY.en,
    success: "Thanks - you are on the updates list.",
    inactive:
      "Updates signup is not open yet. Check back once ASIP confirms the list.",
    alreadySubscribed: "This email is already on the updates list.",
  },
  fr: {
    ...PUBLIC_SUBMIT_GUARD_COPY.fr,
    success: "Merci - vous êtes sur la liste des mises à jour.",
    inactive:
      "L’inscription aux mises à jour n’est pas encore ouverte. Revenez plus tard.",
    alreadySubscribed: "Cet e-mail est déjà sur la liste des mises à jour.",
  },
} as const;

export async function subscribeNewsletter(
  input: NewsletterSubscribeInput,
): Promise<NewsletterActionResult> {
  const locale = await getRequestLocale();
  const copy = PUBLIC_MESSAGES[locale];

  if (!(await getNewsletterSignupEnabled())) {
    return { status: "error", message: copy.inactive };
  }

  const parsed = newsletterSubscribeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? copy.invalidDetails,
    };
  }

  const { email, consent, sourcePage } = parsed.data;

  const guard = await guardPublicFormSubmission({
    rateLimitPrefix: "newsletter",
    identityKind: "email",
    identity: email.toLowerCase(),
    messages: copy,
  });
  if (guard.status === "error") return guard;

  const { error } = await runGuardedAdminWork(guard, (admin) =>
    admin.from("newsletter_subscribers").insert({
      email,
      consent,
      source_page: sourcePage,
    }),
  );

  if (error) {
    if (error.code === "23505") {
      logServerActionError("[newsletter-subscribe]", error, {
        kind: "duplicate",
      });
      return { status: "error", message: copy.alreadySubscribed };
    }
    logServerActionError("[newsletter-subscribe]", error, {
      kind: "insert_failed",
    });
    return { status: "error", message: copy.genericError };
  }

  return { status: "success", message: copy.success };
}
