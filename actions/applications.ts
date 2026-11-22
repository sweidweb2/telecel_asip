"use server";

import { getAdminResource } from "@/constants/admin-resources";
import { getApplicationById } from "@/data/applications";
import {
  refreshAdminResource,
  runAdminMutation
} from "@/lib/admin/run-admin-mutation";
import type { AdminActionResult } from "@/types/admin-action";
import { runInboxStatusMutation } from "@/lib/admin/run-inbox-status-mutation";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  deleteApplicationSchema,
  updateApplicationSchema,
  type DeleteApplicationInput,
  type UpdateApplicationInput,
} from "@/validations/application";
import { type UpdateInboxStatusInput } from "@/validations/inbox";

export type ApplicationActionResult = AdminActionResult;

const resource = getAdminResource("applications");

const ACTION_MESSAGES = {
  en: {
    invalidDetails: "Please check the form and try again.",
    updateSuccess: "Application updated successfully.",
    deleteSuccess: "Application deleted successfully.",
    inboxStatusSuccess: "Inbox status updated.",
    unauthorized: "You do not have permission to manage applications.",
    signedInRequired: "You must be signed in.",
    notFound: "Application not found.",
    duplicate: "You already applied with this company and email.",
    genericError: "Something went wrong. Please try again.",
  },
  fr: {
    invalidDetails: "Vérifiez le formulaire et réessayez.",
    updateSuccess: "Candidature mise à jour avec succès.",
    deleteSuccess: "Candidature supprimée avec succès.",
    inboxStatusSuccess: "Statut de la boîte de réception mis à jour.",
    unauthorized: "Vous n’avez pas la permission de gérer les candidatures.",
    signedInRequired: "Vous devez être connecté.",
    notFound: "Candidature introuvable.",
    duplicate:
      "Vous avez déjà candidaté avec cette entreprise et cet e-mail.",
    genericError: "Une erreur s’est produite. Veuillez réessayer.",
  },
} as const;

function isUniqueViolation(error: {
  code?: string;
  message?: string;
}): boolean {
  if (error.code === "23505") return true;
  const message = (error.message ?? "").toLowerCase();
  return (
    message.includes("applications_email_company") ||
    message.includes("applications_user_company")
  );
}

function refreshApplicationsRoute() {
  refreshAdminResource({
    listPath: resource.listPath,
    cacheTags: resource.cacheTags,
  });
}

export async function updateApplication(
  input: UpdateApplicationInput,
): Promise<ApplicationActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];

  return runAdminMutation({
    schema: updateApplicationSchema,
    input,
    messages: {
      unauthorized: copy.unauthorized,
      signedInRequired: copy.signedInRequired,
      invalidDetails: copy.invalidDetails,
      success: copy.updateSuccess,
      genericError: copy.genericError,
      notFound: copy.notFound,
    },
    execute: async (session, data) => {
      const { data: row, error } = await session.supabase
        .from("applications")
        .update({
          full_name: data.fullName,
          founder_role: data.founderRole,
          email: data.email,
          phone: data.phone,
          country: data.country,
          linkedin: data.linkedin?.trim() ? data.linkedin.trim() : null,
          company_name: data.companyName,
          website: data.website?.trim() ? data.website.trim() : null,
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
      return { status: "success" };
    },
    refresh: () => refreshApplicationsRoute(),
  });
}

export async function deleteApplication(
  input: DeleteApplicationInput,
): Promise<ApplicationActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];

  return runAdminMutation({
    schema: deleteApplicationSchema,
    input,
    messages: {
      unauthorized: copy.unauthorized,
      signedInRequired: copy.signedInRequired,
      invalidDetails: copy.invalidDetails,
      success: copy.deleteSuccess,
      genericError: copy.genericError,
      notFound: copy.notFound,
    },
    execute: async (session, data) => {
      const { data: row, error } = await session.supabase
        .from("applications")
        .delete()
        .eq("id", data.id)
        .select("id")
        .maybeSingle();

      if (error) {
        return { status: "error", message: copy.genericError };
      }
      if (!row) {
        return { status: "error", message: copy.notFound };
      }
      return { status: "success" };
    },
    refresh: () => refreshApplicationsRoute(),
  });
}

export async function updateApplicationInboxStatus(
  input: UpdateInboxStatusInput,
): Promise<ApplicationActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];

  return runInboxStatusMutation({
    table: "applications",
    input,
    messages: {
      unauthorized: copy.unauthorized,
      signedInRequired: copy.signedInRequired,
      invalidDetails: copy.invalidDetails,
      success: copy.inboxStatusSuccess,
      genericError: copy.genericError,
      notFound: copy.notFound,
    },
    refresh: () => refreshApplicationsRoute(),
  });
}

/**
 * Client-callable façade over `data/applications.getApplicationById`.
 * Auth + SELECT stay in `data/`; this exists only so dialogs can invoke the
 * read across the server-action boundary (components must not import `data/`).
 */
export async function loadApplication(id: string) {
  return getApplicationById(id);
}
