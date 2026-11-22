"use server";

import { getAdminResource } from "@/constants/admin-resources";
import { getInvestorEngagementById } from "@/data/investor-engagements";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  refreshAdminResource,
  runAdminMutation
} from "@/lib/admin/run-admin-mutation";
import type { AdminActionResult } from "@/types/admin-action";
import { runInboxStatusMutation } from "@/lib/admin/run-inbox-status-mutation";
import { type UpdateInboxStatusInput } from "@/validations/inbox";
import {
  deleteInvestorEngagementSchema,
  updateInvestorEngagementSchema,
  type DeleteInvestorEngagementInput,
  type UpdateInvestorEngagementInput,
} from "@/validations/investor-engagement";

export type InvestorEngagementActionResult = AdminActionResult;

const resource = getAdminResource("investorEngagements");

const ACTION_MESSAGES = {
  en: {
    invalidDetails: "Please check the form and try again.",
    updateSuccess: "Investor engagement updated successfully.",
    deleteSuccess: "Investor engagement deleted successfully.",
    inboxStatusSuccess: "Inbox status updated.",
    unauthorized: "You do not have permission to manage investor engagements.",
    signedInRequired: "You must be signed in.",
    notFound: "Investor engagement not found.",
    duplicate: "An engagement already exists for this organisation and email.",
    genericError: "Something went wrong. Please try again.",
  },
  fr: {
    invalidDetails: "Vérifiez le formulaire et réessayez.",
    updateSuccess: "Engagement investisseur mis à jour avec succès.",
    deleteSuccess: "Engagement investisseur supprimé avec succès.",
    inboxStatusSuccess: "Statut de la boîte de réception mis à jour.",
    unauthorized:
      "Vous n’avez pas la permission de gérer les engagements investisseurs.",
    signedInRequired: "Vous devez être connecté.",
    notFound: "Engagement investisseur introuvable.",
    duplicate:
      "Un engagement existe déjà pour cette organisation et cet e-mail.",
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
    message.includes("investor_engagements_email_org") ||
    message.includes("investor_engagements_user_org")
  );
}

function refreshInvestorEngagementsRoute() {
  refreshAdminResource({
    listPath: resource.listPath,
    cacheTags: resource.cacheTags,
  });
}

export async function updateInvestorEngagement(
  input: UpdateInvestorEngagementInput,
): Promise<InvestorEngagementActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];

  return runAdminMutation({
    schema: updateInvestorEngagementSchema,
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
      const {
        id,
        fullName,
        email,
        phone,
        organization,
        jobTitle,
        linkedin,
        investorType,
        stages,
        ticketSize,
        sectors,
        geographies,
        engagementIntent,
        thesis,
        timeline,
        referredBy,
        message,
        commsOptIn,
      } = data;

      const { data: row, error } = await session.supabase
        .from("investor_engagements")
        .update({
          full_name: fullName,
          email,
          phone: phone.trim() ? phone.trim() : null,
          organization,
          job_title: jobTitle.trim() ? jobTitle.trim() : null,
          linkedin: linkedin?.trim() ? linkedin.trim() : null,
          investor_type: investorType,
          stages,
          ticket_size: ticketSize,
          sectors,
          geographies,
          engagement_intent: engagementIntent,
          thesis,
          timeline: timeline ?? null,
          referred_by: referredBy.trim() ? referredBy.trim() : null,
          message: message.trim() ? message.trim() : null,
          comms_opt_in: commsOptIn,
        })
        .eq("id", id)
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
    refresh: () => refreshInvestorEngagementsRoute(),
  });
}

export async function deleteInvestorEngagement(
  input: DeleteInvestorEngagementInput,
): Promise<InvestorEngagementActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];

  return runAdminMutation({
    schema: deleteInvestorEngagementSchema,
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
        .from("investor_engagements")
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
    refresh: () => refreshInvestorEngagementsRoute(),
  });
}

export async function updateInvestorEngagementInboxStatus(
  input: UpdateInboxStatusInput,
): Promise<InvestorEngagementActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];

  return runInboxStatusMutation({
    table: "investor_engagements",
    input,
    messages: {
      unauthorized: copy.unauthorized,
      signedInRequired: copy.signedInRequired,
      invalidDetails: copy.invalidDetails,
      success: copy.inboxStatusSuccess,
      genericError: copy.genericError,
      notFound: copy.notFound,
    },
    refresh: () => refreshInvestorEngagementsRoute(),
  });
}

/** Full investor engagement for the shared inbox view/edit dialog. */
export async function loadInvestorEngagement(id: string) {
  return getInvestorEngagementById(id);
}
