import { headers } from "next/headers";

import { consumeSharedRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstileToken } from "@/lib/turnstile";

/** Shared bilingual copy for public form Turnstile + rate-limit failures. */
export const PUBLIC_SUBMIT_GUARD_COPY = {
  en: {
    invalidDetails: "Please check the form and try again.",
    genericError: "Something went wrong. Please try again.",
    rateLimited: "Too many submissions. Please wait and try again later.",
    verificationFailed: "Security check failed. Please try again.",
  },
  fr: {
    invalidDetails: "Veuillez vérifier le formulaire et réessayer.",
    genericError: "Une erreur s’est produite. Veuillez réessayer.",
    rateLimited:
      "Trop de soumissions. Veuillez patienter et réessayer plus tard.",
    verificationFailed:
      "La vérification de sécurité a échoué. Veuillez réessayer.",
  },
} as const;

export const DEFAULT_PUBLIC_RATE_LIMITS = {
  windowMs: 60 * 60 * 1000,
  perIp: 5,
  perIdentity: 3,
} as const;

export type PublicSubmitGuardMessages = {
  verificationFailed: string;
  rateLimited: string;
};

export type PublicSubmitGuardResult =
  | {
      status: "ok";
      ip: string;
      admin: ReturnType<typeof createAdminClient>;
    }
  | { status: "error"; message: string };

/**
 * Client IP from proxy headers (`x-forwarded-for`, then `x-real-ip`).
 * Falls back to `"unknown"` when neither is present.
 */
export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headerStore.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Shared Turnstile + dual rate-limit gate for public marketing submits
 * (applications, interest, contact, newsletter). Callers keep entity insert
 * and business rules; rate-limit key prefixes must stay distinct per form.
 */
export async function guardPublicFormSubmission(options: {
  turnstileToken: string;
  expectedAction: string;
  /** Prefix only — keys become `${prefix}:ip:${ip}` and `${prefix}:${identityKind}:${identity}`. */
  rateLimitPrefix: string;
  identityKind: "user" | "email";
  identity: string;
  messages: PublicSubmitGuardMessages;
  limits?: {
    windowMs?: number;
    perIp?: number;
    perIdentity?: number;
  };
}): Promise<PublicSubmitGuardResult> {
  const {
    turnstileToken,
    expectedAction,
    rateLimitPrefix,
    identityKind,
    identity,
    messages,
    limits,
  } = options;

  const windowMs = limits?.windowMs ?? DEFAULT_PUBLIC_RATE_LIMITS.windowMs;
  const perIp = limits?.perIp ?? DEFAULT_PUBLIC_RATE_LIMITS.perIp;
  const perIdentity =
    limits?.perIdentity ?? DEFAULT_PUBLIC_RATE_LIMITS.perIdentity;

  const ip = await getClientIp();
  const turnstileOk = await verifyTurnstileToken({
    token: turnstileToken,
    expectedAction,
    remoteip: ip,
  });
  if (!turnstileOk) {
    return { status: "error", message: messages.verificationFailed };
  }

  const admin = createAdminClient();
  const ipKey = `${rateLimitPrefix}:ip:${ip}`;
  const identityKey = `${rateLimitPrefix}:${identityKind}:${identity}`;

  if (
    !(await consumeSharedRateLimit(admin, ipKey, perIp, windowMs)) ||
    !(await consumeSharedRateLimit(admin, identityKey, perIdentity, windowMs))
  ) {
    return { status: "error", message: messages.rateLimited };
  }

  return { status: "ok", ip, admin };
}
