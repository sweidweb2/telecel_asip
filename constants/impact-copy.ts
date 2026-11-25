import type { Locale } from "@/constants/locales";
import type { ImpactPageCopy } from "@/types/marketing-page";

/**
 * Impact public page.
 *
 * Metrics rule: do not publish headline numbers until each has a source,
 * measurement period, owner, last-verified date and permission status.
 * Case studies stay a labelled template until founder-specific facts are verified.
 */
const en: ImpactPageCopy = {
  hero: {
    eyebrow: "Impact",
    title: "Proof, not promises.",
    description:
      "ASIP's impact is measured in what founders build through and beyond the program: stronger companies, new markets, partnerships, investment readiness, jobs and technology used in the real world.",
    cta: { slug: "founders", label: "Explore founder outcomes" },
  },
  progress: {
    eyebrow: "Core proof points",
    title: "Proof lives in what founders build next.",
    description: "",
  },
  lenses: {
    eyebrow: "Impact lenses",
    title: "How impact is read",
    description: "",
    footnote: "",
    columns: {
      lens: "Lens",
      framing: "What it shows",
      evidence: "",
    },
    rows: [
      { id: "pipeline", lens: "Pipeline", framing: "How widely founder interest reaches across African markets.", evidence: "" },
      { id: "inclusion", lens: "Inclusion", framing: "Who is building and where opportunity is reaching.", evidence: "" },
      { id: "growth", lens: "Business growth", framing: "How companies progress through and beyond ASIP.", evidence: "" },
      { id: "commercialisation", lens: "Commercialisation", framing: "Where products become pilots, customers or partnerships.", evidence: "" },
      { id: "jobs", lens: "Jobs & capability", framing: "How founder growth creates work and builds skills.", evidence: "" },
      { id: "sector", lens: "Real-world use", framing: "How portfolio products are used in sectors such as health, finance, mobility or education.", evidence: "" },
    ],
  },
  caseStudy: {
    eyebrow: "Case studies",
    title: "From a real problem to measurable progress.",
    templateLabel: "",
    body: "",
    note: "",
    empty: "",
    comingSoon: "",
    readStory: "Read full story",
    loadMore: "Load more stories",
    prevLabel: "Previous case studies",
    nextLabel: "Next case studies",
    steps: {
      barrier: "The problem",
      support: "The ASIP role",
      outcome: "Where they are now",
    },
  },
  evidenceRule: {
    eyebrow: "Evidence rule",
    title: "How impact is verified.",
    description:
      "Material public claims are reviewed against a named source, reporting period and owner before publication. Metrics that cannot be substantiated are not published.",
    requirements: [
      { id: "source", label: "Source" },
      { id: "period", label: "Measurement period" },
      { id: "owner", label: "Owner" },
      { id: "verified", label: "Last verified" },
      { id: "permission", label: "Permission" },
    ],
  },
  ctaSection: {
    title: "Meet the people building what comes next.",
    description: "",
    slug: "founders",
    label: "Explore the portfolio",
  },
};

const fr: ImpactPageCopy = {
  hero: {
    eyebrow: "Impact",
    title: "Des preuves, pas des promesses.",
    description:
      "L’impact d’ASIP se mesure à ce que les fondateurs construisent pendant et après le programme : des entreprises plus solides, de nouveaux marchés, des partenariats, la préparation à l’investissement, des emplois et des technologies utilisées dans le monde réel.",
    cta: { slug: "founders", label: "Explorer les résultats des fondateurs" },
  },
  progress: {
    eyebrow: "Preuves clés",
    title: "La preuve, c’est ce que les fondateurs construisent ensuite.",
    description: "",
  },
  lenses: {
    eyebrow: "Angles d’impact",
    title: "Comment lire l’impact",
    description: "",
    footnote: "",
    columns: { lens: "Angle", framing: "Ce qu’il montre", evidence: "" },
    rows: [
      { id: "pipeline", lens: "Vivier", framing: "Jusqu’où l’intérêt des fondateurs s’étend sur les marchés africains.", evidence: "" },
      { id: "inclusion", lens: "Inclusion", framing: "Qui construit et où l’opportunité arrive.", evidence: "" },
      { id: "growth", lens: "Croissance", framing: "Comment les entreprises progressent pendant et après ASIP.", evidence: "" },
      { id: "commercialisation", lens: "Commercialisation", framing: "Où les produits deviennent pilotes, clients ou partenariats.", evidence: "" },
      { id: "jobs", lens: "Emplois et compétences", framing: "Comment la croissance des fondateurs crée du travail et des compétences.", evidence: "" },
      { id: "sector", lens: "Usage réel", framing: "Comment les produits du portefeuille sont utilisés en santé, finance, mobilité ou éducation.", evidence: "" },
    ],
  },
  caseStudy: {
    eyebrow: "Études de cas",
    title: "D’un vrai problème à des progrès mesurables.",
    templateLabel: "",
    body: "",
    note: "",
    empty: "",
    comingSoon: "",
    readStory: "Lire l’histoire complète",
    loadMore: "Afficher plus d’histoires",
    prevLabel: "Études de cas précédentes",
    nextLabel: "Études de cas suivantes",
    steps: {
      barrier: "Le problème",
      support: "Le rôle d’ASIP",
      outcome: "Où ils en sont",
    },
  },
  evidenceRule: {
    eyebrow: "Règle de preuve",
    title: "Comment l’impact est vérifié.",
    description:
      "Les affirmations publiques importantes sont vérifiées auprès d’une source nommée, d’une période de référence et d’un responsable avant publication. Les indicateurs qui ne peuvent pas être étayés ne sont pas publiés.",
    requirements: [
      { id: "source", label: "Source" },
      { id: "period", label: "Période de mesure" },
      { id: "owner", label: "Responsable" },
      { id: "verified", label: "Dernière vérification" },
      { id: "permission", label: "Autorisation" },
    ],
  },
  ctaSection: {
    title: "Rencontrez ceux qui construisent la suite.",
    description: "",
    slug: "founders",
    label: "Explorer le portefeuille",
  },
};

export function impactCopyFor(locale: Locale): ImpactPageCopy {
  return locale === "fr" ? fr : en;
}
