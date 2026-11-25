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
      "ASIP helps ambitious technology founders strengthen the fundamentals behind growth: product, strategy, market understanding, commercial readiness, investor readiness and the relationships that can open the next door.",
    primaryCta: { slug: "register-interest", label: "Register interest" },
    secondaryCta: { slug: "founders", label: "Explore founders" },
  },
  aiDirection: {
    eyebrow: "Building the AI Advantage",
    title: "AI that earns its place in the business.",
    description:
      "The 2026 direction focuses on founders using AI to solve real operating, customer and market problems. The emphasis is practical advantage: better products, better decisions, stronger productivity and new ways to grow.",
  },
  audience: {
    eyebrow: "Who it is for",
    title: "Built for ambitious technology ventures solving real market problems.",
    description:
      "Exact stage, sector, geography and selection criteria are confirmed for each cohort. At a minimum, ASIP looks for strong founder insight, a credible technology-led solution, evidence of market need and the ambition to scale.",
    highlights: [
      { id: "team", label: "Founder insight" },
      { id: "product", label: "Technology-led solution" },
      { id: "market", label: "Evidence of market need" },
    ],
  },
  journey: {
    title: "Founder journey",
    steps: [
      {
        id: "discover",
        title: "Discover",
        description:
          "Find founders solving meaningful problems with clear market potential.",
      },
      {
        id: "build",
        title: "Build",
        description:
          "Sharpen product, strategy, operations and leadership around the company's real priorities.",
      },
      {
        id: "select",
        title: "Test",
        description:
          "Pressure-test assumptions with mentors, market insight and relevant technical or commercial expertise.",
      },
      {
        id: "connect",
        title: "Accelerate",
        description:
          "Strengthen investor readiness, market access and pathways to pilots, customers or partnerships.",
      },
      {
        id: "grow",
        title: "Scale",
        description:
          "Prepare for growth across customers and markets, with continued portfolio visibility where relevant.",
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
          "Specialist input shaped around the company's real growth constraints, not generic classroom theory.",
      },
      {
        id: "intelligence",
        title: "Market access",
        description:
          "Sharper understanding of customers, sectors, regulation and commercial pathways in relevant markets.",
      },
      {
        id: "investment",
        title: "Investor readiness",
        description:
          "Clearer narratives, stronger metrics, better materials and preparation for investor conversations.",
      },
      {
        id: "network",
        title: "Technology & tools",
        description:
          "Access to relevant technical expertise, platforms or partner resources where available.",
      },
      {
        id: "commercial",
        title: "Commercial pathways",
        description:
          "Opportunities to explore pilots, customers and partnerships where there is a genuine strategic fit.",
      },
      {
        id: "visibility",
        title: "Founder visibility",
        description:
          "A stronger platform for credible founder stories, portfolio milestones and relevant industry exposure.",
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
    notice: "",
  },
  ctaSection: {
    title: "Your next build could start here.",
    description: "",
    slug: "register-interest",
    label: "Register interest",
  },
};

const fr: ProgrammePageCopy = {
  hero: {
    eyebrow: "Le programme",
    title: "Construire l’entreprise, pas seulement le pitch.",
    description:
      "ASIP aide les fondateurs technologiques ambitieux à renforcer les fondamentaux de la croissance : produit, stratégie, compréhension du marché, préparation commerciale, préparation à l’investissement et les relations qui ouvrent la porte suivante.",
    primaryCta: { slug: "register-interest", label: "Manifester votre intérêt" },
    secondaryCta: { slug: "founders", label: "Explorer les fondateurs" },
  },
  aiDirection: {
    eyebrow: "Construire l’avantage IA",
    title: "Une IA qui a sa place dans l’entreprise.",
    description:
      "L’orientation 2026 met l’accent sur les fondateurs qui utilisent l’IA pour résoudre de vrais problèmes opérationnels, clients et de marché : de meilleurs produits, de meilleures décisions, plus de productivité et de nouvelles façons de grandir.",
  },
  audience: {
    eyebrow: "Pour qui",
    title: "Conçu pour des entreprises technologiques ambitieuses qui résolvent de vrais problèmes de marché.",
    description:
      "Le stade, le secteur, la géographie et les critères de sélection sont confirmés pour chaque cohorte. Au minimum, ASIP recherche une solide connaissance du problème, une solution technologique crédible, des preuves d’un besoin réel et l’ambition de grandir.",
    highlights: [
      { id: "team", label: "Connaissance du problème" },
      { id: "product", label: "Solution technologique" },
      { id: "market", label: "Besoin de marché prouvé" },
    ],
  },
  journey: {
    title: "Parcours fondateur",
    steps: [
      { id: "discover", title: "Découvrir", description: "Repérer des fondateurs qui résolvent des problèmes importants avec un potentiel de marché clair." },
      { id: "build", title: "Construire", description: "Affiner produit, stratégie, opérations et leadership autour des vraies priorités de l’entreprise." },
      { id: "select", title: "Tester", description: "Mettre les hypothèses à l’épreuve avec des mentors, la connaissance du marché et une expertise technique ou commerciale." },
      { id: "connect", title: "Accélérer", description: "Renforcer la préparation à l’investissement, l’accès aux marchés et les voies vers des pilotes, clients ou partenariats." },
      { id: "grow", title: "Grandir", description: "Préparer la croissance sur plusieurs clients et marchés, avec une visibilité continue dans le portefeuille si pertinent." },
    ],
  },
  value: {
    title: "Ce que les fondateurs y gagnent",
    items: [
      { id: "expertise", title: "Expertise concrète", description: "Un appui spécialisé adapté aux vraies contraintes de croissance de l’entreprise, pas une théorie générique." },
      { id: "intelligence", title: "Accès aux marchés", description: "Une meilleure compréhension des clients, secteurs, réglementations et voies commerciales sur les marchés pertinents." },
      { id: "investment", title: "Préparation à l’investissement", description: "Un récit plus clair, de meilleurs indicateurs et supports, et une préparation aux échanges avec les investisseurs." },
      { id: "network", title: "Technologie et outils", description: "Accès à une expertise technique, des plateformes ou des ressources partenaires selon disponibilité." },
      { id: "commercial", title: "Voies commerciales", description: "Des occasions d’explorer pilotes, clients et partenariats lorsqu’il existe une réelle adéquation stratégique." },
      { id: "visibility", title: "Visibilité des fondateurs", description: "Une plateforme plus solide pour des récits crédibles, des étapes du portefeuille et une exposition sectorielle pertinente." },
    ],
  },
  eligibility: {
    title: "Éligibilité générale",
    imageAlt: "Fondateurs ASIP travaillant sur ordinateur lors d’une session du programme",
    items: [
      "Résoudre un problème réel et significatif (business, industrie ou communauté).",
      "Compter au moins une femme dans l’équipe fondatrice ou la direction exécutive.",
      "Disposer d’un produit ou d’une solution déjà sur le marché.",
      "Démontrer un revenu existant ou une traction commerciale.",
      "Avoir un fondateur engagé à temps plein dans l’entreprise.",
    ],
    notice: "",
  },
  ctaSection: {
    title: "Votre prochaine étape pourrait commencer ici.",
    description: "",
    slug: "register-interest",
    label: "Manifester votre intérêt",
  },
};

export function programmeCopyFor(locale: Locale): ProgrammePageCopy {
  return locale === "fr" ? fr : en;
}
