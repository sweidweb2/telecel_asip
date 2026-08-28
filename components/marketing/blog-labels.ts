import type { Locale } from "@/constants/locales";
import type { BlogTabId } from "@/constants/blog-ui";

export type BlogLabels = {
  writtenBy: string;
  publishedOn: string;
  fileUnder: string;
  emptyState: string;
  tabs: { id: BlogTabId; label: string }[];
  previous: string;
  next: string;
};

const EN: BlogLabels = {
  writtenBy: "Written by",
  publishedOn: "Published on",
  fileUnder: "File under",
  emptyState: "No published articles yet. Check back soon.",
  tabs: [
    { id: "all", label: "View all" },
    { id: "design", label: "Design" },
    { id: "product", label: "Product" },
    { id: "software-engineering", label: "Software Engineering" },
    { id: "customer-success", label: "Customer Success" },
  ],
  previous: "Previous",
  next: "Next",
};

const FR: BlogLabels = {
  writtenBy: "Rédigé par",
  publishedOn: "Publié le",
  fileUnder: "Classé sous",
  emptyState: "Aucun article publié pour le moment. Revenez bientôt.",
  tabs: [
    { id: "all", label: "Tout voir" },
    { id: "design", label: "Design" },
    { id: "product", label: "Produit" },
    { id: "software-engineering", label: "Ingénierie logicielle" },
    { id: "customer-success", label: "Succès client" },
  ],
  previous: "Précédent",
  next: "Suivant",
};

export function blogLabelsFor(locale: Locale): BlogLabels {
  return locale === "fr" ? FR : EN;
}
