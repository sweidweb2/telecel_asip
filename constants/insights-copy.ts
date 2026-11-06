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
    title: "Stories, signals and lessons from the ecosystem.",
    description:
      "Founder stories, portfolio progress, program news and practical perspectives from across the ASIP ecosystem.",
  },
  streams: {
    columns: {
      stream: "Content stream",
      purpose: "Purpose",
      example: "Example headline",
    },
    rows: [
      {
        id: "founder-stories",
        stream: "Founder Stories",
        purpose: "Human, evidence-led stories from the portfolio.",
        example:
          "How [Founder] is redesigning access to [service] across [market].",
      },
      {
        id: "portfolio-news",
        stream: "Portfolio News",
        purpose:
          "Verified milestones, partnerships, funding and expansion.",
        example: "[Startup] enters [market] following [validated milestone].",
      },
      {
        id: "programme-updates",
        stream: "Program Updates",
        purpose: "Cohort, application, event and demo-day status.",
        example: "ASIP opens registration for its next founder cycle.",
      },
      {
        id: "founder-resources",
        stream: "Founder Resources",
        purpose: "Practical guides, tools and useful sessions.",
        example: "What to prepare before your first enterprise pilot.",
      },
      {
        id: "partner-perspectives",
        stream: "Partner Perspectives",
        purpose:
          "Useful expertise from operators and ecosystem partners.",
        example:
          "What corporates need before a startup pilot can scale.",
      },
    ],
  },
  updates: {
    title: "Stay close to the next chapter.",
    description:
      "Register for confirmed ASIP program updates, founder stories and ecosystem opportunities.",
    slug: "register-interest",
    label: "Register for updates",
  },
};

const fr: InsightsPageCopy = {
  hero: {
    eyebrow: "Perspectives",
    title: "Récits, signaux et enseignements de l’écosystème.",
    description:
      "Récits de fondateurs, avancées du portefeuille, actualités du programme et regards concrets de l’écosystème ASIP.",
  },
  streams: {
    columns: {
      stream: "Fil de contenus",
      purpose: "Objectif",
      example: "Exemple de titre",
    },
    rows: [
      {
        id: "founder-stories",
        stream: "Récits de fondateurs",
        purpose:
          "Récits humains, fondés sur des faits, issus du portefeuille.",
        example:
          "Comment [Fondateur] redéfinit l’accès à [service] sur [marché].",
      },
      {
        id: "portfolio-news",
        stream: "Actualités du portefeuille",
        purpose:
          "Étapes vérifiées, partenariats, financements et expansion.",
        example:
          "[Startup] entre sur [marché] après [étape validée].",
      },
      {
        id: "programme-updates",
        stream: "Actualités du programme",
        purpose:
          "Statut des cohortes, candidatures, événements et demo days.",
        example:
          "ASIP ouvre les inscriptions pour son prochain cycle de fondateurs.",
      },
      {
        id: "founder-resources",
        stream: "Ressources pour fondateurs",
        purpose: "Guides pratiques, outils et sessions utiles.",
        example:
          "Que préparer avant votre premier pilote en entreprise.",
      },
      {
        id: "partner-perspectives",
        stream: "Regards de partenaires",
        purpose:
          "Expertise utile d’opérateurs et de partenaires de l’écosystème.",
        example:
          "Ce dont les entreprises ont besoin avant qu’un pilote startup puisse passer à l’échelle.",
      },
    ],
  },
  updates: {
    title: "Restez proche du prochain chapitre.",
    description:
      "Inscrivez-vous pour recevoir les actualités confirmées du programme ASIP, les récits de fondateurs et les opportunités de l’écosystème.",
    slug: "register-interest",
    label: "S’inscrire aux actualités",
  },
};

export function insightsCopyFor(locale: Locale): InsightsPageCopy {
  return locale === "fr" ? fr : en;
}
