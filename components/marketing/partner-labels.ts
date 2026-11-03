import type { Locale } from "@/constants/locales";

export type PartnerLabels = {
  historicalTitle: string;
  historicalDescription: string;
  emptyState: string;
  emptyFilterState: string;
  /** Network tab — show every partner in the current list. */
  allFilter: string;
  visitPartner: string;
  /** Heading for partner types that have no copy row yet. */
  otherTitle: string;
};

const EN: PartnerLabels = {
  historicalTitle: "Previous chapters",
  historicalDescription:
    "Organizations and mentors who worked with ASIP founders in earlier chapters.",
  emptyState: "Partner listings are being updated. Check back soon.",
  emptyFilterState: "No partners in this category yet.",
  allFilter: "All",
  visitPartner: "Visit",
  otherTitle: "Other partners",
};

const FR: PartnerLabels = {
  historicalTitle: "Chapitres précédents",
  historicalDescription:
    "Organisations et mentors ayant travaillé avec les fondateurs ASIP lors des chapitres précédents.",
  emptyState: "Les partenaires sont en cours de mise à jour. Revenez bientôt.",
  emptyFilterState: "Aucun partenaire dans cette catégorie pour le moment.",
  allFilter: "Tous",
  visitPartner: "Visiter",
  otherTitle: "Autres partenaires",
};

export function partnerLabelsFor(locale: Locale): PartnerLabels {
  return locale === "fr" ? FR : EN;
}
