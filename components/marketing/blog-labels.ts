import type { Locale } from "@/constants/locales";
import { categoryToTabId, type BlogTabId } from "@/constants/blog-ui";

export type BlogLabels = {
  pageTitle: string;
  pageDescription: string;
  writtenBy: string;
  publishedOn: string;
  fileUnder: string;
  emptyState: string;
  emptyStreamState: string;
  tabs: { id: BlogTabId; label: string }[];
  previous: string;
  next: string;
};

const EN: BlogLabels = {
  pageTitle: "From the people building.",
  pageDescription:
    "Founder stories, portfolio milestones and program updates from across ASIP. Keep the emphasis on what changed, what was built and what matters now.",
  writtenBy: "Written by",
  publishedOn: "Published on",
  fileUnder: "File under",
  emptyState: "",
  emptyStreamState: "No articles in this stream yet.",
  tabs: [
    { id: "all", label: "View all" },
    { id: "founder-stories", label: "Founder & Portfolio Stories" },
    { id: "programme-updates", label: "Program Updates" },
    // Hidden until populated (Text Pack v2): tabs with no articles never render.
    { id: "founder-resources", label: "Founder Resources" },
    { id: "partner-perspectives", label: "Partner Perspectives" },
  ],
  previous: "Previous",
  next: "Next",
};

const FR: BlogLabels = {
  pageTitle: "De la part de ceux qui construisent.",
  pageDescription:
    "Histoires de fondateurs, actualités du portefeuille, mises à jour du programme et perspectives concrètes de l’écosystème ASIP.",
  writtenBy: "Rédigé par",
  publishedOn: "Publié le",
  fileUnder: "Classé sous",
  emptyState: "Aucun article publié pour le moment. Revenez bientôt.",
  emptyStreamState: "Aucun article dans ce fil pour le moment.",
  tabs: [
    { id: "all", label: "Tout voir" },
    { id: "founder-stories", label: "Histoires de fondateurs et du portefeuille" },
    { id: "programme-updates", label: "Actualités du programme" },
    { id: "founder-resources", label: "Ressources pour fondateurs" },
    { id: "partner-perspectives", label: "Regards de partenaires" },
  ],
  previous: "Précédent",
  next: "Suivant",
};

/**
 * Public category chip for an article. CMS rows keep their stored name;
 * the site shows the v2 category label (portfolio news shares the
 * "Founder & Portfolio Stories" category). Unknown names pass through.
 */
export function publicCategoryLabel(name: string, locale: Locale): string {
  const id = categoryToTabId(name);
  const tabId = id === "portfolio-news" ? "founder-stories" : id;
  if (tabId === "all") return name;
  return blogLabelsFor(locale).tabs.find((tab) => tab.id === tabId)?.label ?? name;
}

export function blogLabelsFor(locale: Locale): BlogLabels {
  return locale === "fr" ? FR : EN;
}
