import type { Locale } from "@/constants/locales";
import type { AlumniPageCopy } from "@/types/marketing-page";

/**
 * Alumni public page (Eleanor-validated copy).
 *
 * Linked from the primary nav. Keep out of the sitemap and search index
 * until the Alumni Network operating model, benefits and launch are
 * formally confirmed.
 *
 * Phase 1 scope: no login, member dashboard, chat, community platform or
 * bespoke alumni functionality. The primary CTA opens the public founders
 * directory — the only community surface that already exists.
 */
const en: AlumniPageCopy = {
  hero: {
    eyebrow: "Alumni experience",
    title: "The cohort ends. The connection continues.",
    description:
      "ASIP is building a stronger alumni experience designed to keep founders connected beyond the formal programme, creating more opportunities to share knowledge, collaborate and stay close to the wider ecosystem.",
    primaryCta: { slug: "founders", label: "Explore the community" },
  },
  purpose: {
    title: "Built for what comes after.",
    description:
      "Founders face different challenges as companies grow. The Alumni Network is intended to create a practical space for peer connection, founder-to-founder learning, relevant introductions and continued visibility across the ASIP community.",
  },
  benefits: {
    items: [
      {
        id: "community",
        title: "Founder community",
        description:
          "Stay connected to founders from across ASIP cohorts and markets.",
      },
      {
        id: "learning",
        title: "Peer learning",
        description:
          "Exchange practical experience with people facing similar growth decisions.",
      },
      {
        id: "opportunities",
        title: "Opportunities",
        description:
          "Access relevant introductions, events and ecosystem opportunities where available.",
      },
      {
        id: "visibility",
        title: "Visibility",
        description:
          "Continue sharing credible founder progress through ASIP channels.",
      },
      {
        id: "give-back",
        title: "Give back",
        description:
          "Contribute experience to future founders through mentoring, conversations and community participation.",
      },
    ],
  },
  notice: "",
  ctaSection: {
    title: "The cohort ends. The connection continues.",
    description:
      "Explore founders across ASIP cohorts while the alumni network takes shape.",
    slug: "founders",
    label: "Explore the community",
  },
};

const fr: AlumniPageCopy = {
  hero: {
    eyebrow: "Expérience alumni",
    title: "La cohorte s’achève. Le lien continue.",
    description:
      "ASIP construit une expérience alumni plus solide, conçue pour garder les fondateurs connectés au-delà du programme formel, et ouvrir davantage d’occasions de partager des connaissances, de collaborer et de rester proches de l’écosystème.",
    primaryCta: { slug: "founders", label: "Explorer la communauté" },
  },
  purpose: {
    title: "Conçu pour ce qui vient après.",
    description:
      "Les fondateurs rencontrent d’autres défis à mesure que les entreprises grandissent. Le réseau alumni vise à créer un espace concret pour le lien entre pairs, l’apprentissage de fondateur à fondateur, des introductions pertinentes et une visibilité continue au sein de la communauté ASIP.",
  },
  benefits: {
    items: [
      {
        id: "community",
        title: "Communauté de fondateurs",
        description:
          "Restez connectés aux fondateurs des cohortes et marchés ASIP.",
      },
      {
        id: "learning",
        title: "Apprentissage entre pairs",
        description:
          "Échangez une expérience concrète avec des personnes confrontées aux mêmes décisions de croissance.",
      },
      {
        id: "opportunities",
        title: "Opportunités",
        description:
          "Accédez aux introductions, événements et opportunités d’écosystème pertinents, lorsqu’ils existent.",
      },
      {
        id: "visibility",
        title: "Visibilité",
        description:
          "Continuez à partager des avancées crédibles via les canaux ASIP.",
      },
      {
        id: "give-back",
        title: "Transmettre",
        description:
          "Apportez votre expérience aux prochains fondateurs par le mentorat, les échanges et la participation à la communauté.",
      },
    ],
  },
  notice: "",
  ctaSection: {
    title: "La cohorte s’achève. Le lien continue.",
    description:
      "Explorez les fondateurs des cohortes ASIP pendant que le réseau alumni prend forme.",
    slug: "founders",
    label: "Explorer la communauté",
  },
};

export function alumniCopyFor(locale: Locale): AlumniPageCopy {
  return locale === "fr" ? fr : en;
}
