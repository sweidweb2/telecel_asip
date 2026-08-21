import type { Locale } from "@/constants/locales";
import type { BlogSortId, BlogTabId } from "@/constants/blog-articles";

export type BlogLabels = {
  eyebrow: string;
  title: string;
  description: string;
  writtenBy: string;
  publishedOn: string;
  fileUnder: string;
  sortAriaLabel: string;
  tabs: { id: BlogTabId; label: string }[];
  sortOptions: { id: BlogSortId; label: string }[];
  previous: string;
  next: string;
};

const EN: BlogLabels = {
  eyebrow: "Our blog",
  title: "Resources and insights",
  description:
    "The latest industry news, interviews, technologies, and resources.",
  writtenBy: "Written by",
  publishedOn: "Published on",
  fileUnder: "File under",
  sortAriaLabel: "Sort by",
  tabs: [
    { id: "all", label: "View all" },
    { id: "design", label: "Design" },
    { id: "product", label: "Product" },
    { id: "software-engineering", label: "Software Engineering" },
    { id: "customer-success", label: "Customer Success" },
  ],
  sortOptions: [
    { id: "recent", label: "Most recent" },
    { id: "popular", label: "Most popular" },
    { id: "viewed", label: "Most viewed" },
  ],
  previous: "Previous",
  next: "Next",
};

const FR: BlogLabels = {
  eyebrow: "Notre blog",
  title: "Ressources et analyses",
  description:
    "Les dernières actualités, interviews, technologies et ressources.",
  writtenBy: "Rédigé par",
  publishedOn: "Publié le",
  fileUnder: "Classé sous",
  sortAriaLabel: "Trier par",
  tabs: [
    { id: "all", label: "Tout voir" },
    { id: "design", label: "Design" },
    { id: "product", label: "Produit" },
    { id: "software-engineering", label: "Ingénierie logicielle" },
    { id: "customer-success", label: "Succès client" },
  ],
  sortOptions: [
    { id: "recent", label: "Plus récents" },
    { id: "popular", label: "Plus populaires" },
    { id: "viewed", label: "Plus consultés" },
  ],
  previous: "Précédent",
  next: "Suivant",
};

export function blogLabelsFor(locale: Locale): BlogLabels {
  return locale === "fr" ? FR : EN;
}
