"use server";

import { getAdminResource } from "@/constants/admin-resources";
import { getOpenApplications } from "@/data/settings";
import { getAuthUser } from "@/lib/admin/get-auth-user";
import {
  refreshAdminResource,
  type AdminActionResult,
} from "@/lib/admin/run-admin-mutation";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  guardPublicFormSubmission,
  PUBLIC_SUBMIT_GUARD_COPY,
} from "@/lib/intake/submit-guard";
import { TURNSTILE_APPLY_ACTION } from "@/types/turnstile";
import {
  interestRegistrationSchemaFor,
  type InterestRegistrationInput,
} from "@/validations/interest-registration";

export type SubmitInterestRegistrationResult = AdminActionResult;

const resource = getAdminResource("registrations");
const REGISTER_INTEREST_CONSENT_VERSION = "2026-09-17";

const MESSAGES = {
  en: {
    ...PUBLIC_SUBMIT_GUARD_COPY.en,
    success: "Thank you - your interest has been registered.",
    signedInRequired: "Sign in to register your interest.",
    duplicate: "You already registered this company with this email.",
    applicationsOpen:
      "Applications are open. Submit an official application instead of registering interest.",
  },
  fr: {
    ...PUBLIC_SUBMIT_GUARD_COPY.fr,
    success: "Merci - votre intérêt a bien été enregistré.",
    signedInRequired: "Connectez-vous pour manifester votre intérêt.",
    duplicate:
      "Vous avez déjà enregistré cette entreprise avec cet e-mail.",
    applicationsOpen:
      "Les candidatures sont ouvertes. Envoyez une candidature officielle plutôt que de manifester votre intérêt.",
  },
} as const;

function isUniqueViolation(error: {
  code?: string;
  message?: string;
}): boolean {
  if (error.code === "23505") return true;
  const message = (error.message ?? "").toLowerCase();
  return (
    message.includes("interest_registrations_email_company") ||
    message.includes("interest_registrations_user_company")
  );
}

export async function submitInterestRegistration(
  input: InterestRegistrationInput,
): Promise<SubmitInterestRegistrationResult> {
  const locale = await getRequestLocale();
  const copy = MESSAGES[locale];

  if (await getOpenApplications()) {
    return { status: "error", message: copy.applicationsOpen };
  }

  const user = await getAuthUser();
  if (!user?.email) {
    return { status: "error", message: copy.signedInRequired };
  }

  const sessionEmail = user.email.trim().toLowerCase();
  const parsed = interestRegistrationSchemaFor(locale).safeParse({
    ...input,
    email: sessionEmail,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? copy.invalidDetails,
    };
  }

  const {
    fullName,
    founderRole,
    phone,
    country,
    linkedin,
    companyName,
    website,
    companyCountry,
    sector,
    pitch,
    consent,
    commsOptIn,
    turnstileToken,
  } = parsed.data;

  const guard = await guardPublicFormSubmission({
    turnstileToken,
    expectedAction: TURNSTILE_APPLY_ACTION,
    rateLimitPrefix: "apply",
    identityKind: "user",
    identity: user.id,
    messages: copy,
  });
  if (guard.status === "error") return guard;

  const { error } = await guard.admin.from("interest_registrations").insert({
    user_id: user.id,
    full_name: fullName,
    founder_role: founderRole,
    email: sessionEmail,
    phone,
    country,
    linkedin: linkedin?.trim() ? linkedin.trim() : null,
    company_name: companyName,
    website: website?.trim() ? website.trim() : null,
    company_country: companyCountry,
    sector,
    pitch: pitch?.trim() ? pitch.trim() : null,
    consent,
    comms_opt_in: commsOptIn,
    locale,
    source_path: `/${locale}/register-interest`,
    consent_version: REGISTER_INTEREST_CONSENT_VERSION,
  });

  if (error) {
    if (isUniqueViolation(error)) {
      return { status: "error", message: copy.duplicate };
    }
    return { status: "error", message: copy.genericError };
  }

  refreshAdminResource({
    listPath: resource.listPath,
    cacheTags: resource.cacheTags,
    bustNavCounts: false,
  });
  return { status: "success", message: copy.success };
}
