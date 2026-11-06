import type { Locale } from "@/constants/locales";
import type { ProgrammePageCopy } from "@/types/marketing-page";

/**
 * Programme public page.
 *
 * Cohort rule: when applications open, replace general eligibility language
 * (and any related audience copy) with the officially approved cohort
 * criteria, dates, format and terms.
 */
const en: ProgrammePageCopy = {
  hero: {
    eyebrow: "The program",
    title: "Build the company, not just the pitch.",
    description:
      "ASIP helps ambitious African technology founders strengthen the fundamentals behind growth: product, strategy, operations, market access, investor readiness and the relationships that help opportunities become real.",
    primaryCta: { slug: "register-interest", label: "Register interest" },
    secondaryCta: { slug: "founders", label: "Explore past cohorts" },
  },
  audience: {
    eyebrow: "Who it is for",
    title:
      "Built for ambitious technology ventures solving real African market problems.",
    description:
      "ASIP is designed for founders with a credible team, a technology-enabled solution, a meaningful African market opportunity and the ambition to build beyond one customer or one geography. Exact stage, sector, geography and selection criteria are published for each cohort.",
    highlights: [
      { id: "team", label: "Credible team" },
      { id: "product", label: "Tech-enabled solution" },
      { id: "market", label: "African market" },
    ],
  },
  journey: {
    title: "Founder journey",
    steps: [
      {
        id: "discover",
        title: "Discover",
        description:
          "ASIP identifies founders through applications, ecosystem partners and market networks.",
      },
      {
        id: "select",
        title: "Select",
        description:
          "Teams are assessed against founder quality, problem relevance, product potential, traction, scalability and program fit.",
      },
      {
        id: "build",
        title: "Build",
        description:
          "Selected founders work with mentors and specialists to sharpen product, strategy, operations, leadership and investor readiness.",
      },
      {
        id: "connect",
        title: "Open access",
        description:
          "ASIP opens structured access to partners, investors, corporate buyers, technical expertise and market intelligence.",
      },
      {
        id: "commercialise",
        title: "Commercialize",
        description:
          "Founders prepare for pilots, customer conversations, proof-of-concept opportunities and longer-term partnerships.",
      },
      {
        id: "grow",
        title: "Grow",
        description:
          "Strong founders stay close to the wider ASIP ecosystem, with follow-on visibility and portfolio support where relevant.",
      },
    ],
  },
  value: {
    title: "What founders gain",
    items: [
      {
        id: "expertise",
        title: "Practical expertise",
        description:
          "Specialist support shaped around the company’s real growth constraints, not generic classroom theory.",
      },
      {
        id: "network",
        title: "Founder network",
        description:
          "Access to mentors, operators, investors and peers who understand what it takes to build.",
      },
      {
        id: "intelligence",
        title: "Market intelligence",
        description:
          "Sharper insight into customers, sectors, regulation and commercial pathways.",
      },
      {
        id: "investment",
        title: "Investment readiness",
        description:
          "Stronger narratives, metrics, data rooms and fundraising preparation.",
      },
      {
        id: "commercial",
        title: "Commercial pathways",
        description:
          "Routes to potential corporate and public-sector use cases where strategic fit exists.",
      },
      {
        id: "visibility",
        title: "Visibility",
        description:
          "Founder stories, demo opportunities and access to relevant industry platforms.",
      },
      {
        id: "continuity",
        title: "Continuity",
        description:
          "A relationship with the portfolio that can continue beyond the cohort, subject to program priorities.",
      },
    ],
  },
  eligibility: {
    title: "General eligibility",
    imageAlt: "ASIP founders working on laptops during a program session",
    items: [
      "Solve a real and meaningful problem (business, industry, or community-related).",
      "Have at least one woman represented within the founding team or executive leadership.",
      "Have a proven product or solution in market.",
      "Demonstrate existing revenue or commercial traction.",
      "Have a founder working full-time within the business.",
    ],
    notice:
      "Official cohort criteria, dates, format and terms are published when applications open.",
  },
  ctaSection: {
    title: "Ready for the next chapter?",
    description:
      "Register interest for updates, or explore founders who have already built through ASIP.",
    slug: "register-interest",
    label: "Register interest",
  },
};

const fr: ProgrammePageCopy = {
  hero: {
    eyebrow: "Le programme",
    title: "Construire l’entreprise, pas seulement le pitch.",
    description:
      "ASIP aide les fondateurs technologiques africains ambitieux à renforcer les fondamentaux de la croissance : produit, stratégie, opérations, accès au marché, préparation à l’investissement et les relations qui transforment les opportunités en résultats concrets.",
    primaryCta: { slug: "register-interest", label: "Manifester votre intérêt" },
    secondaryCta: { slug: "founders", label: "Explorer les cohortes passées" },
  },
  audience: {
    eyebrow: "Pour qui",
    title:
      "Conçu pour les entreprises technologiques ambitieuses qui résolvent de vrais problèmes de marché en Afrique.",
    description:
      "ASIP s’adresse aux fondateurs qui ont une équipe crédible, une solution technologique, une opportunité de marché africaine significative et l’ambition de construire au-delà d’un client ou d’une géographie. Le stade, le secteur, la géographie et les critères de sélection sont publiés pour chaque cohorte.",
    highlights: [
      { id: "team", label: "Équipe crédible" },
      { id: "product", label: "Solution technologique" },
      { id: "market", label: "Marché africain" },
    ],
  },
  journey: {
    title: "Parcours du fondateur",
    steps: [
      {
        id: "discover",
        title: "Découvrir",
        description:
          "ASIP identifie les fondateurs via les candidatures, les partenaires de l’écosystème et les réseaux de marché.",
      },
      {
        id: "select",
        title: "Sélectionner",
        description:
          "Les équipes sont évaluées selon la qualité des fondateurs, la pertinence du problème, le potentiel du produit, la traction, la scalabilité et l’adéquation au programme.",
      },
      {
        id: "build",
        title: "Construire",
        description:
          "Les fondateurs sélectionnés travaillent avec des mentors et des spécialistes pour affiner le produit, la stratégie, les opérations, le leadership et la préparation à l’investissement.",
      },
      {
        id: "connect",
        title: "Ouvrir l’accès",
        description:
          "ASIP ouvre un accès structuré aux partenaires, investisseurs, acheteurs corporate, à l’expertise technique et à l’intelligence de marché.",
      },
      {
        id: "commercialise",
        title: "Commercialiser",
        description:
          "Les fondateurs se préparent aux pilotes, aux conversations clients, aux preuves de concept et aux partenariats de plus long terme.",
      },
      {
        id: "grow",
        title: "Grandir",
        description:
          "Les fondateurs solides restent proches de l’écosystème ASIP, avec une visibilité de suivi et un accompagnement du portefeuille lorsque cela est pertinent.",
      },
    ],
  },
  value: {
    title: "Ce que les fondateurs y gagnent",
    items: [
      {
        id: "expertise",
        title: "Expertise pratique",
        description:
          "Un accompagnement de spécialistes calé sur les vraies contraintes de croissance de l’entreprise, pas une théorie générique de salle de classe.",
      },
      {
        id: "network",
        title: "Réseau de fondateurs",
        description:
          "Accès à des mentors, opérateurs, investisseurs et pairs qui savent ce qu’il faut pour construire.",
      },
      {
        id: "intelligence",
        title: "Intelligence de marché",
        description:
          "Une lecture plus nette des clients, des secteurs, de la régulation et des voies commerciales.",
      },
      {
        id: "investment",
        title: "Préparation à l’investissement",
        description:
          "Des récits plus solides, des métriques, des data rooms et une préparation à la levée.",
      },
      {
        id: "commercial",
        title: "Voies commerciales",
        description:
          "Des voies vers des cas d’usage corporate et du secteur public lorsque l’adéquation stratégique existe.",
      },
      {
        id: "visibility",
        title: "Visibilité",
        description:
          "Des histoires de fondateurs, des opportunités de démo et l’accès aux plateformes sectorielles pertinentes.",
      },
      {
        id: "continuity",
        title: "Continuité",
        description:
          "Une relation avec le portefeuille qui peut se poursuivre au-delà de la cohorte, selon les priorités du programme.",
      },
    ],
  },
  eligibility: {
    title: "Éligibilité générale",
    imageAlt: "Des fondateurs ASIP au travail lors d’une session du programme",
    items: [
      "Résoudre un problème réel et significatif (lié à une entreprise, un secteur ou une communauté).",
      "Compter au moins une femme dans l’équipe fondatrice ou la direction exécutive.",
      "Disposer d’un produit ou d’une solution ayant fait ses preuves sur le marché.",
      "Démontrer des revenus existants ou une traction commerciale.",
      "Avoir au moins un fondateur ou une fondatrice à temps plein dans l’entreprise.",
    ],
    notice:
      "Les critères, dates, format et conditions officiels de chaque cohorte sont publiés à l’ouverture des candidatures.",
  },
  ctaSection: {
    title: "Prêt pour le prochain chapitre ?",
    description:
      "Manifestez votre intérêt pour les mises à jour, ou explorez les fondateurs déjà passés par ASIP.",
    slug: "register-interest",
    label: "Manifester votre intérêt",
  },
};

export function programmeCopyFor(locale: Locale): ProgrammePageCopy {
  return locale === "fr" ? fr : en;
}
