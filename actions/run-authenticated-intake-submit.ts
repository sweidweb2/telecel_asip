import type { Locale } from "@/constants/locales";
import { getOpenApplicationsFresh } from "@/data/settings";
import { getCurrentUserProfile } from "@/data/users";
import { getAuthUser } from "@/lib/admin/get-auth-user";
import { logServerActionError } from "@/lib/admin/log-server-action-error";
import {
  mapPgActionError,
  type PgActionError,
} from "@/lib/admin/pg-action-error";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  guardPublicFormSubmission,
  runGuardedAdminWork,
  type PublicSubmitGuardMessages,
} from "@/lib/intake/submit-guard";
import type { createAdminClient } from "@/lib/supabase/admin";
import type { AdminActionResult } from "@/types/admin-action";
import type { ProfileType } from "@/types/profile";

type AdminClient = ReturnType<typeof createAdminClient>;

export type AuthenticatedIntakeMessages = PublicSubmitGuardMessages & {
  success: string;
  signedInRequired: string;
  accountTypeRejected: string;
  applicationsGate: string;
  duplicate: string;
  invalidDetails: string;
  genericError: string;
};

export type AuthenticatedIntakeAccountGate =
  | { mode: "require"; type: ProfileType }
  | { mode: "forbid"; type: ProfileType };

type AuthUser = NonNullable<Awaited<ReturnType<typeof getAuthUser>>>;

type IntakeParseResult<TParsed> =
  | { success: true; data: TParsed }
  | { success: false; error: { issues: Array<{ message?: string }> } };

/**
 * Shared pipeline for signed-in public intake submits (founder + investor).
 * Lives under `actions/` (not `lib/`) because it reads `data/` for the
 * open-applications gate and profile type check.
 */
export async function runAuthenticatedIntakeSubmit<
  TInput,
  TParsed extends Record<string, unknown>,
>(options: {
  input: TInput;
  messages: Record<Locale, AuthenticatedIntakeMessages>;
  applicationsMustBeOpen: boolean;
  accountGate: AuthenticatedIntakeAccountGate;
  parse: (args: {
    input: TInput;
    sessionEmail: string;
    locale: Locale;
  }) => IntakeParseResult<TParsed>;
  rateLimitPrefix: string;
  uniqueConstraintNeedles: readonly string[];
  insert: (args: {
    admin: AdminClient;
    user: AuthUser;
    data: TParsed;
    sessionEmail: string;
    locale: Locale;
  }) => Promise<{ error: PgActionError | null }>;
  refresh: () => void;
}): Promise<AdminActionResult> {
  const locale = await getRequestLocale();
  const copy = options.messages[locale];

  // Settings + session + profile are independent; profile reuses cached auth.
  const [applicationsOpen, user, profile] = await Promise.all([
    getOpenApplicationsFresh(),
    getAuthUser(),
    getCurrentUserProfile(),
  ]);
  if (options.applicationsMustBeOpen ? !applicationsOpen : applicationsOpen) {
    return { status: "error", message: copy.applicationsGate };
  }

  if (!user?.email) {
    return { status: "error", message: copy.signedInRequired };
  }

  const profileType = profile?.type;
  if (options.accountGate.mode === "require") {
    if (profileType !== options.accountGate.type) {
      return { status: "error", message: copy.accountTypeRejected };
    }
  } else if (profileType === options.accountGate.type) {
    return { status: "error", message: copy.accountTypeRejected };
  }

  const sessionEmail = user.email.trim().toLowerCase();
  const parsed = options.parse({
    input: options.input,
    sessionEmail,
    locale,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? copy.invalidDetails,
    };
  }

  const data = parsed.data;
  const guard = await guardPublicFormSubmission({
    rateLimitPrefix: options.rateLimitPrefix,
    identityKind: "user",
    identity: user.id,
    messages: copy,
  });
  if (guard.status === "error") return guard;

  const { error } = await runGuardedAdminWork(guard, (admin) =>
    options.insert({
      admin,
      user,
      data,
      sessionEmail,
      locale,
    }),
  );

  if (error) {
    const lower = (error.message ?? "").toLowerCase();
    // DB BEFORE INSERT triggers (open/closed TOCTOU) raise P0001 with these texts.
    if (
      lower.includes("applications are closed") ||
      lower.includes("applications are open")
    ) {
      logServerActionError("[intake-submit]", error, {
        kind: "applications_gate",
        rateLimitPrefix: options.rateLimitPrefix,
      });
      return { status: "error", message: copy.applicationsGate };
    }
    // Intake inserts have no junction-table uniques — any 23505 is a duplicate.
    if (error.code === "23505" || lower.includes("duplicate")) {
      logServerActionError("[intake-submit]", error, {
        kind: "duplicate",
        rateLimitPrefix: options.rateLimitPrefix,
      });
      return { status: "error", message: copy.duplicate };
    }
    logServerActionError("[intake-submit]", error, {
      kind: "insert_failed",
      rateLimitPrefix: options.rateLimitPrefix,
    });
    return {
      status: "error",
      message: mapPgActionError(error, {
        unauthorized: copy.genericError,
        notFound: copy.genericError,
        genericError: copy.genericError,
        uniqueViolation: copy.duplicate,
        uniqueConstraint: [...options.uniqueConstraintNeedles],
      }),
    };
  }

  options.refresh();
  return { status: "success", message: copy.success };
}
