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
  investorEngagementSchemaFor,
  type InvestorEngagementInput,
} from "@/validations/investor-engagement";

export type SubmitInvestorEngagementResult = AdminActionResult;

const CONSENT_VERSION = "2026-11-10";

const MESSAGES = {
  en: {
    ...PUBLIC_SUBMIT_GUARD_COPY.en,
    success: "Thank you - your investor engagement request has been submitted.",
    signedInRequired: "Sign in to submit an investor engagement request.",
    investorOnly: "This form is for investor accounts only.",
    duplicate: "You already submitted an engagement request for this organisation.",
    applicationsClosed:
      "Engagement is closed. Register your investor interest to hear when the next chapter opens.",
  },
  fr: {
    ...PUBLIC_SUBMIT_GUARD_COPY.fr,
    success: "Merci - votre demande d’engagement investisseur a bien été envoyée.",
    signedInRequired:
      "Connectez-vous pour envoyer une demande d’engagement investisseur.",
    investorOnly: "Ce formulaire est réservé aux comptes investisseurs.",
    duplicate:
      "Vous avez déjà envoyé une demande d’engagement pour cette organisation.",
    applicationsClosed:
      "Les engagements sont fermés. Manifestez votre intérêt d’investisseur pour être informé de la suite.",
  },
} as const;

function isUniqueViolation(error: {
  code?: string;
  message?: string;
}): boolean {
  if (error.code === "23505") return true;
  const message = (error.message ?? "").toLowerCase();
  return (
    message.includes("investor_engagements_email_org") ||
    message.includes("investor_engagements_user_org")
  );
}

export async function submitInvestorEngagement(
  input: InvestorEngagementInput,
): Promise<SubmitInvestorEngagementResult> {
  const locale = await getRequestLocale();
  const copy = MESSAGES[locale];

  if (!(await getOpenApplications())) {
    return { status: "error", message: copy.applicationsClosed };
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
  const parsed = investorEngagementSchemaFor(locale).safeParse({
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
    rateLimitPrefix: "investor-engagement",
    identityKind: "user",
    identity: user.id,
    messages: copy,
  });
  if (guard.status === "error") return guard;

  const { error } = await guard.admin.from("investor_engagements").insert({
    user_id: user.id,
    full_name: data.fullName,
    email: sessionEmail,
    phone: data.phone.trim() ? data.phone.trim() : null,
    organization: data.organization,
    job_title: data.jobTitle.trim() ? data.jobTitle.trim() : null,
    linkedin: data.linkedin.trim() ? data.linkedin.trim() : null,
    investor_type: data.investorType,
    stages: data.stages,
    ticket_size: data.ticketSize,
    sectors: data.sectors,
    geographies: data.geographies,
    engagement_intent: data.engagementIntent,
    thesis: data.thesis,
    timeline: data.timeline ?? null,
    referred_by: data.referredBy.trim() ? data.referredBy.trim() : null,
    message: data.message.trim() ? data.message.trim() : null,
    consent: data.consent,
    comms_opt_in: data.commsOptIn,
    locale,
    source_path: `/${locale}/apply`,
    consent_version: CONSENT_VERSION,
  });

  if (error) {
    if (isUniqueViolation(error)) {
      return { status: "error", message: copy.duplicate };
    }
    return { status: "error", message: copy.genericError };
  }

  revalidateTag("investor-engagements", "max");
  return { status: "success", message: copy.success };
}
