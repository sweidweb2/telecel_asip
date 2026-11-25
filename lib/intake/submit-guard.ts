import {
  consumeSharedRateLimit,
  releaseSharedRateLimit,
} from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { createAdminClient } from "@/lib/supabase/admin";

export { getClientIp } from "@/lib/request-ip";

/** Shared bilingual copy for public form rate-limit failures. */
export const PUBLIC_SUBMIT_GUARD_COPY = {
  en: {
    invalidDetails: "Please check the form and try again.",
    genericError: "Something went wrong. Please try again.",
    rateLimited: "Too many submissions. Please wait and try again later.",
  },
  fr: {
    invalidDetails: "Veuillez vérifier le formulaire et réessayer.",
    genericError: "Une erreur s’est produite. Veuillez réessayer.",
    rateLimited:
      "Trop de soumissions. Veuillez patienter et réessayer plus tard.",
  },
} as const;

export const DEFAULT_PUBLIC_RATE_LIMITS = {
  windowMs: 60 * 60 * 1000,
  perIp: 5,
  perIdentity: 3,
} as const;

export type PublicSubmitGuardMessages = {
  rateLimited: string;
};

export type PublicSubmitGuardResult =
  | {
      status: "ok";
      ip: string;
      admin: ReturnType<typeof createAdminClient>;
      /** Refund IP + identity hits after a failed entity insert. */
      releaseRateLimits: () => Promise<void>;
    }
  | { status: "error"; message: string };

/**
 * Dual rate-limit gate for public marketing submits (applications, interest,
 * contact, newsletter). Callers keep entity insert and business rules;
 * rate-limit key prefixes must stay distinct per form.
 *
 * Hits are recorded before insert. Prefer `runGuardedAdminWork(guard, …)` for
 * the entity write so quota is refunded automatically on error / throw.
 */
export async function guardPublicFormSubmission(options: {
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
  const { rateLimitPrefix, identityKind, identity, messages, limits } = options;

  const windowMs = limits?.windowMs ?? DEFAULT_PUBLIC_RATE_LIMITS.windowMs;
  const perIp = limits?.perIp ?? DEFAULT_PUBLIC_RATE_LIMITS.perIp;
  const perIdentity =
    limits?.perIdentity ?? DEFAULT_PUBLIC_RATE_LIMITS.perIdentity;

  const ip = await getClientIp();
  const admin = createAdminClient();
  const ipKey = `${rateLimitPrefix}:ip:${ip}`;
  const identityKey = `${rateLimitPrefix}:${identityKind}:${identity}`;

  if (!(await consumeSharedRateLimit(admin, ipKey, perIp, windowMs))) {
    return { status: "error", message: messages.rateLimited };
  }

  if (
    !(await consumeSharedRateLimit(admin, identityKey, perIdentity, windowMs))
  ) {
    // Identity blocked after IP passed — refund the IP hit.
    await releaseSharedRateLimit(admin, ipKey);
    return { status: "error", message: messages.rateLimited };
  }

  return {
    status: "ok",
    ip,
    admin,
    releaseRateLimits: async () => {
      await Promise.all([
        releaseSharedRateLimit(admin, ipKey),
        releaseSharedRateLimit(admin, identityKey),
      ]);
    },
  };
}

type OkPublicSubmitGuard = Extract<PublicSubmitGuardResult, { status: "ok" }>;

/**
 * Run the entity insert (or equivalent) after a successful guard.
 * Always refunds IP + identity quota when `work` returns an error or throws,
 * so callers cannot burn limits by forgetting `releaseRateLimits()`.
 */
export async function runGuardedAdminWork<
  T extends { error: { message?: string; code?: string } | null },
>(
  guard: OkPublicSubmitGuard,
  work: (admin: OkPublicSubmitGuard["admin"]) => PromiseLike<T>,
): Promise<T> {
  try {
    const result = await work(guard.admin);
    if (result.error) {
      await guard.releaseRateLimits();
    }
    return result;
  } catch (err) {
    await guard.releaseRateLimits();
    throw err;
  }
}
