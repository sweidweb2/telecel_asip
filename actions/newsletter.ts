"use server";

import { headers } from "next/headers";

import { getNewsletterSignupEnabled } from "@/data/settings";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { isRateLimited, recordRateLimitHit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { TURNSTILE_NEWSLETTER_ACTION } from "@/types/turnstile";
import {
  newsletterSubscribeSchema,
  type NewsletterSubscribeInput,
} from "@/validations/newsletter";

export type NewsletterActionResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const PUBLIC_MESSAGES = {
  en: {
    invalidDetails: "Please check the form and try again.",
    success: "Thanks — you are on the updates list.",
    genericError: "Something went wrong. Please try again.",
    rateLimited: "Too many submissions. Please wait and try again later.",
    verificationFailed: "Security check failed. Please try again.",
    inactive:
      "Updates signup is not open yet. Check back once ASIP confirms the list.",
    alreadySubscribed: "This email is already on the updates list.",
  },
  fr: {
    invalidDetails: "Veuillez vérifier le formulaire et réessayer.",
    success: "Merci — vous êtes sur la liste des mises à jour.",
    genericError: "Une erreur s’est produite. Veuillez réessayer.",
    rateLimited:
      "Trop de soumissions. Veuillez patienter et réessayer plus tard.",
    verificationFailed:
      "La vérification de sécurité a échoué. Veuillez réessayer.",
    inactive:
      "L’inscription aux mises à jour n’est pas encore ouverte. Revenez plus tard.",
    alreadySubscribed: "Cet e-mail est déjà sur la liste des mises à jour.",
  },
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

  const { email, consent, sourcePage, turnstileToken } = parsed.data;
  const ip = await getClientIp();

  const turnstileOk = await verifyTurnstileToken({
    token: turnstileToken,
    expectedAction: TURNSTILE_NEWSLETTER_ACTION,
    remoteip: ip,
  });
  if (!turnstileOk) {
    return { status: "error", message: copy.verificationFailed };
  }

  const ipKey = `newsletter:ip:${ip}`;
  const emailKey = `newsletter:email:${email.toLowerCase()}`;

  if (
    isRateLimited(ipKey, RATE_LIMIT_PER_IP, RATE_LIMIT_WINDOW_MS) ||
    isRateLimited(emailKey, RATE_LIMIT_PER_EMAIL, RATE_LIMIT_WINDOW_MS)
  ) {
    return { status: "error", message: copy.rateLimited };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("newsletter_subscribers").insert({
    email,
    consent,
    source_page: sourcePage,
  });

  if (error) {
    if (error.code === "23505") {
      return { status: "error", message: copy.alreadySubscribed };
    }
    return { status: "error", message: copy.genericError };
  }

  recordRateLimitHit(ipKey, RATE_LIMIT_WINDOW_MS);
  recordRateLimitHit(emailKey, RATE_LIMIT_WINDOW_MS);

  return { status: "success", message: copy.success };
}
