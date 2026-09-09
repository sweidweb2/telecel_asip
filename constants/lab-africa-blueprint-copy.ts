import type { Locale } from "@/constants/locales";

export type LabAfricaBlueprintCopy = {
  eyebrow: string;
  title: string;
  description: string;
  drawingId: string;
  titleBlock: {
    eyebrow: string;
    title: string;
    detail: string;
  };
};

const en: LabAfricaBlueprintCopy = {
  eyebrow: "Ecosystem schematic",
  title: "Building Africa’s next generation of innovation.",
  description:
    "A working plan for founders, capital, and connectivity - how ASIP links technology, partnerships and growth across the continent.",
  drawingId: "ASIP-DWG-01",
  titleBlock: {
    eyebrow: "Ecosystem",
    title: "How ASIP connects Africa",
    detail: "Founders, partners, capital & markets",
  },
};

const fr: LabAfricaBlueprintCopy = {
  eyebrow: "Schéma écosystème",
  title: "Construire la prochaine génération d’innovation en Afrique.",
  description:
    "Un plan de travail pour les fondateurs, le capital et la connectivité - comment ASIP relie technologie, partenariats et croissance sur le continent.",
  drawingId: "ASIP-DWG-01",
  titleBlock: {
    eyebrow: "Écosystème",
    title: "Comment ASIP relie l’Afrique",
    detail: "Fondateurs, partenaires, capital et marchés",
  },
};

export function labAfricaBlueprintCopyFor(
  locale: Locale,
): LabAfricaBlueprintCopy {
  return locale === "fr" ? fr : en;
}
