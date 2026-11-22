import type { Locale } from "@/constants/locales";
import { getOpenApplicationsFresh } from "@/data/settings";
import { getCurrentUserProfile } from "@/data/users";
import { getAuthUser } from "@/lib/admin/get-auth-user";
import {
  mapPgActionError,
  type PgActionError,
} from "@/lib/admin/pg-action-error";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  guardPublicFormSubmission,
  type PublicSubmitGuardMessages,
} from "@/lib/intake/submit-guard";
import type { createAdminClient } from "@/lib/supabase/admin";
import type { AdminActionResult } from "@/types/admin-action";
import type { ProfileType } from "@/types/profile";
import { TURNSTILE_APPLY_ACTION } from "@/types/turnstile";

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
  TParsed extends { turnstileToken: string },
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

  const applicationsOpen = await getOpenApplicationsFresh();
  if (options.applicationsMustBeOpen ? !applicationsOpen : applicationsOpen) {
    return { status: "error", message: copy.applicationsGate };
  }

  const user = await getAuthUser();
  if (!user?.email) {
    return { status: "error", message: copy.signedInRequired };
  }

  const profile = await getCurrentUserProfile();
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
    turnstileToken: data.turnstileToken,
    expectedAction: TURNSTILE_APPLY_ACTION,
    rateLimitPrefix: options.rateLimitPrefix,
    identityKind: "user",
    identity: user.id,
    messages: copy,
  });
  if (guard.status === "error") return guard;

  const { error } = await options.insert({
    admin: guard.admin,
    user,
    data,
    sessionEmail,
    locale,
  });

  if (error) {
    const lower = (error.message ?? "").toLowerCase();
    // DB BEFORE INSERT triggers (open/closed TOCTOU) raise P0001 with these texts.
    if (
      lower.includes("applications are closed") ||
      lower.includes("applications are open")
    ) {
      return { status: "error", message: copy.applicationsGate };
    }
    // Intake inserts have no junction-table uniques — any 23505 is a duplicate.
    if (error.code === "23505" || lower.includes("duplicate")) {
      return { status: "error", message: copy.duplicate };
    }
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
