"use server";

import { revalidateTag } from "next/cache";

import { getOpenApplications } from "@/data/settings";
import { getCurrentUserProfile } from "@/data/users";
import { getAuthUser } from "@/lib/admin/get-auth-user";
import type { AdminActionResult } from "@/lib/admin/run-admin-mutation";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  guardPublicFormSubmission,
  PUBLIC_SUBMIT_GUARD_COPY,
} from "@/lib/intake/submit-guard";
import { TURNSTILE_APPLY_ACTION } from "@/types/turnstile";
import {
  investorInterestSchemaFor,
  type InvestorInterestInput,
} from "@/validations/investor-interest";

export type SubmitInvestorInterestResult = AdminActionResult;

const CONSENT_VERSION = "2026-11-10";

const MESSAGES = {
  en: {
    ...PUBLIC_SUBMIT_GUARD_COPY.en,
    success: "Thank you - your investor interest has been registered.",
    signedInRequired: "Sign in to register your investor interest.",
    investorOnly: "This form is for investor accounts only.",
    duplicate: "You already registered interest for this organisation.",
    applicationsOpen:
      "Engagement is open. Submit the full investor engagement form instead.",
  },
  fr: {
    ...PUBLIC_SUBMIT_GUARD_COPY.fr,
    success: "Merci - votre intérêt d’investisseur a bien été enregistré.",
    signedInRequired:
      "Connectez-vous pour manifester votre intérêt d’investisseur.",
    investorOnly: "Ce formulaire est réservé aux comptes investisseurs.",
    duplicate: "Vous avez déjà enregistré cette organisation.",
    applicationsOpen:
      "Les engagements sont ouverts. Envoyez le formulaire d’engagement investisseur complet.",
  },
} as const;

function isUniqueViolation(error: {
  code?: string;
  message?: string;
}): boolean {
  if (error.code === "23505") return true;
  const message = (error.message ?? "").toLowerCase();
  return (
    message.includes("investor_interests_email_org") ||
    message.includes("investor_interests_user_org")
  );
}

export async function submitInvestorInterest(
  input: InvestorInterestInput,
): Promise<SubmitInvestorInterestResult> {
  const locale = await getRequestLocale();
  const copy = MESSAGES[locale];

  if (await getOpenApplications()) {
    return { status: "error", message: copy.applicationsOpen };
  }

  const user = await getAuthUser();
  if (!user?.email) {
    return { status: "error", message: copy.signedInRequired };
  }

  const profile = await getCurrentUserProfile();
  if (profile?.type !== "investor") {
    return { status: "error", message: copy.investorOnly };
  }

  const sessionEmail = user.email.trim().toLowerCase();
  const parsed = investorInterestSchemaFor(locale).safeParse({
    ...input,
    email: sessionEmail,
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
    rateLimitPrefix: "investor-interest",
    identityKind: "user",
    identity: user.id,
    messages: copy,
  });
  if (guard.status === "error") return guard;

  const { error } = await guard.admin.from("investor_interests").insert({
    user_id: user.id,
    full_name: data.fullName,
    email: sessionEmail,
    phone: data.phone.trim() ? data.phone.trim() : null,
    organization: data.organization,
    job_title: data.jobTitle.trim() ? data.jobTitle.trim() : null,
    linkedin: data.linkedin.trim() ? data.linkedin.trim() : null,
    investor_type: data.investorType,
    focus_note: data.focusNote.trim() ? data.focusNote.trim() : null,
    consent: data.consent,
    comms_opt_in: data.commsOptIn,
    locale,
    source_path: `/${locale}/register-interest`,
    consent_version: CONSENT_VERSION,
  });

  if (error) {
    if (isUniqueViolation(error)) {
      return { status: "error", message: copy.duplicate };
    }
    return { status: "error", message: copy.genericError };
  }

  revalidateTag("investor-interests", "max");
  return { status: "success", message: copy.success };
}
