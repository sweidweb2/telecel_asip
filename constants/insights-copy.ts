import type { Locale } from "@/constants/locales";
import type { InsightsPageCopy } from "@/types/marketing-page";

/**
 * Insights public index.
 *
 * Email-capture rule: do not add a newsletter form until privacy language,
 * routing and an owner are confirmed. The updates CTA uses register-interest.
 */
const en: InsightsPageCopy = {
  hero: {
    eyebrow: "Insights",
    title: "From the people building.",
    description:
      "Founder stories, portfolio milestones and programme updates from across ASIP. Keep the emphasis on what changed, what was built and what matters now.",
  },
  streams: {
    columns: {
      stream: "Category",
      purpose: "Purpose",
      example: "",
    },
    rows: [
      {
        id: "founder-stories",
        stream: "Founder & Portfolio Stories",
        purpose: "Human, evidence-led stories and verified company milestones.",
        example: "",
      },
      {
        id: "programme-updates",
        stream: "Programme Updates",
        purpose: "Cohort status, AI Advantage activity, events and application updates.",
        example: "",
      },
    ],
  },
  updates: {
    title: "Stay close to what's next.",
    description:
      "Receive confirmed ASIP programme updates, founder stories and relevant ecosystem opportunities.",
    slug: "register-interest",
    label: "Register for updates",
  },
};

const fr: InsightsPageCopy = {
  hero: {
    eyebrow: "Perspectives",
    title: "De la part de ceux qui construisent.",
    description:
      "Histoires de fondateurs, étapes du portefeuille et actualités du programme ASIP, centrées sur ce qui a changé, ce qui a été construit et ce qui compte maintenant.",
  },
  streams: {
    columns: { stream: "Catégorie", purpose: "Objectif", example: "" },
    rows: [
      { id: "founder-stories", stream: "Histoires de fondateurs et du portefeuille", purpose: "Des récits humains et fondés sur des preuves, et des étapes vérifiées des entreprises.", example: "" },
      { id: "programme-updates", stream: "Actualités du programme", purpose: "Statut des cohortes, activité Avantage IA, événements et candidatures.", example: "" },
    ],
  },
  updates: {
    title: "Restez au plus près de la suite.",
    description:
      "Recevez les actualités confirmées du programme ASIP, des histoires de fondateurs et des opportunités pertinentes de l’écosystème.",
    slug: "register-interest",
    label: "S’inscrire aux actualités",
  },
};

export function insightsCopyFor(locale: Locale): InsightsPageCopy {
  return locale === "fr" ? fr : en;
}
