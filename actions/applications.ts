"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import type { Locale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { authorizeAdmin } from "@/lib/admin/authorize-admin";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { isRateLimited, recordRateLimitHit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { TURNSTILE_APPLY_ACTION } from "@/types/turnstile";
import {
  applicationSchemaFor,
  deleteApplicationSchema,
  updateApplicationSchema,
  type ApplicationInput,
  type DeleteApplicationInput,
  type UpdateApplicationInput,
} from "@/validations/application";

export type ApplicationActionResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const ACTION_MESSAGES = {
  en: {
    invalidDetails: "Please check the form and try again.",
    success: "Thank you — your application has been submitted.",
    genericError: "Something went wrong. Please try again.",
    updateSuccess: "Application updated successfully.",
    deleteSuccess: "Application deleted successfully.",
    unauthorized: "You do not have permission to manage applications.",
    signedInRequired: "You must be signed in.",
    notFound: "Application not found.",
    rateLimited: "Too many submissions. Please wait and try again later.",
    duplicate: "You already applied with this company and email.",
    verificationFailed: "Security check failed. Please try again.",
  },
  fr: {
    invalidDetails: "Veuillez vérifier le formulaire et réessayer.",
    success: "Merci — votre candidature a bien été envoyée.",
    genericError: "Une erreur s’est produite. Veuillez réessayer.",
    updateSuccess: "Candidature mise à jour avec succès.",
    deleteSuccess: "Candidature supprimée avec succès.",
    unauthorized: "Vous n’avez pas la permission de gérer les candidatures.",
    signedInRequired: "Vous devez être connecté.",
    notFound: "Candidature introuvable.",
    rateLimited:
      "Trop de soumissions. Veuillez patienter et réessayer plus tard.",
    duplicate:
      "Vous avez déjà candidaté avec cette entreprise et cet e-mail.",
    verificationFailed:
      "La vérification de sécurité a échoué. Veuillez réessayer.",
  },
} as const;

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_PER_IP = 5;
const RATE_LIMIT_PER_EMAIL = 3;

function validationMessage(
  error: { issues: { message: string }[] },
  locale: Locale,
): string {
  return error.issues[0]?.message ?? ACTION_MESSAGES[locale].invalidDetails;
}

function isUniqueViolation(error: {
  code?: string;
  message?: string;
}): boolean {
  if (error.code === "23505") return true;
  const message = (error.message ?? "").toLowerCase();
  return message.includes("applications_email_company");
}

async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headerStore.get("x-real-ip")?.trim() || "unknown";
}

function refreshApplicationsRoute() {
  revalidatePath(ROUTES.applications);
}

export async function submitApplication(
  input: ApplicationInput,
): Promise<ApplicationActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];
  const parsed = applicationSchemaFor(locale).safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? copy.invalidDetails,
    };
  }

  const data = parsed.data;
  const ip = await getClientIp();
  const turnstileOk = await verifyTurnstileToken({
    token: data.turnstileToken,
    expectedAction: TURNSTILE_APPLY_ACTION,
    remoteip: ip,
  });
  if (!turnstileOk) {
    return { status: "error", message: copy.verificationFailed };
  }

  const ipKey = `application:ip:${ip}`;
  const emailKey = `application:email:${data.email}`;

  if (
    isRateLimited(ipKey, RATE_LIMIT_PER_IP, RATE_LIMIT_WINDOW_MS) ||
    isRateLimited(emailKey, RATE_LIMIT_PER_EMAIL, RATE_LIMIT_WINDOW_MS)
  ) {
    return { status: "error", message: copy.rateLimited };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("applications").insert({
    full_name: data.fullName,
    founder_role: data.founderRole,
    email: data.email,
    phone: data.phone,
    country: data.country,
    linkedin: data.linkedin,
    company_name: data.companyName,
    website: data.website,
    company_country: data.companyCountry,
    sector: data.sector,
    problem_product: data.problemProduct,
    traction: data.traction,
    programme_fit: data.programmeFit,
    consent: data.consent,
    comms_opt_in: data.commsOptIn,
  });

  if (error) {
    if (isUniqueViolation(error)) {
      return { status: "error", message: copy.duplicate };
    }
    return { status: "error", message: copy.genericError };
  }

  recordRateLimitHit(ipKey, RATE_LIMIT_WINDOW_MS);
  recordRateLimitHit(emailKey, RATE_LIMIT_WINDOW_MS);

  refreshApplicationsRoute();
  return { status: "success", message: copy.success };
}

export async function updateApplication(
  input: UpdateApplicationInput,
): Promise<ApplicationActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];
  const parsed = updateApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: validationMessage(parsed.error, locale) };
  }

  const session = await authorizeAdmin(ACTION_MESSAGES[locale]);
  if (session.status === "error") return session;

  const data = parsed.data;
  const { data: row, error } = await session.supabase
    .from("applications")
    .update({
      full_name: data.fullName,
      founder_role: data.founderRole,
      email: data.email,
      phone: data.phone,
      country: data.country,
      linkedin: data.linkedin,
      company_name: data.companyName,
      website: data.website,
      company_country: data.companyCountry,
      sector: data.sector,
      problem_product: data.problemProduct,
      traction: data.traction,
      programme_fit: data.programmeFit,
      comms_opt_in: data.commsOptIn,
    })
    .eq("id", data.id)
    .select("id")
    .maybeSingle();

  if (error) {
    if (isUniqueViolation(error)) {
      return { status: "error", message: copy.duplicate };
    }
    return { status: "error", message: copy.genericError };
  }

  if (!row) {
    return { status: "error", message: copy.notFound };
  }

  refreshApplicationsRoute();
  return { status: "success", message: copy.updateSuccess };
}

export async function deleteApplication(
  input: DeleteApplicationInput,
): Promise<ApplicationActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];
  const parsed = deleteApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: validationMessage(parsed.error, locale) };
  }

  const session = await authorizeAdmin(ACTION_MESSAGES[locale]);
  if (session.status === "error") return session;

  const { data, error } = await session.supabase
    .from("applications")
    .delete()
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: copy.genericError };
  }

  if (!data) {
    return { status: "error", message: copy.notFound };
  }

  refreshApplicationsRoute();
  return { status: "success", message: copy.deleteSuccess };
}
