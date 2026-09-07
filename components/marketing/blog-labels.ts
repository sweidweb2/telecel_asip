import type { Locale } from "@/constants/locales";
import type { BlogTabId } from "@/constants/blog-ui";

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
  pageTitle: "Insights",
  pageDescription:
    "Founder stories, portfolio news, programme updates and practical perspectives from across the ASIP ecosystem.",
  writtenBy: "Written by",
  publishedOn: "Published on",
  fileUnder: "File under",
  emptyState: "No published articles yet. Check back soon.",
  emptyStreamState: "No articles in this stream yet.",
  tabs: [
    { id: "all", label: "View all" },
    { id: "founder-stories", label: "Founder Stories" },
    { id: "portfolio-news", label: "Portfolio News" },
    { id: "programme-updates", label: "Programme Updates" },
    { id: "founder-resources", label: "Founder Resources" },
    { id: "partner-perspectives", label: "Partner Perspectives" },
  ],
  previous: "Previous",
  next: "Next",
};

const FR: BlogLabels = {
  pageTitle: "Perspectives",
  pageDescription:
    "Histoires de fondateurs, actualités du portefeuille, mises à jour du programme et perspectives concrètes de l’écosystème ASIP.",
  writtenBy: "Rédigé par",
  publishedOn: "Publié le",
  fileUnder: "Classé sous",
  emptyState: "Aucun article publié pour le moment. Revenez bientôt.",
  emptyStreamState: "Aucun article dans ce fil pour le moment.",
  tabs: [
    { id: "all", label: "Tout voir" },
    { id: "founder-stories", label: "Récits de fondateurs" },
    { id: "portfolio-news", label: "Actualités du portefeuille" },
    { id: "programme-updates", label: "Actualités du programme" },
    { id: "founder-resources", label: "Ressources pour fondateurs" },
    { id: "partner-perspectives", label: "Regards de partenaires" },
  ],
  previous: "Précédent",
  next: "Suivant",
};

export function blogLabelsFor(locale: Locale): BlogLabels {
  return locale === "fr" ? FR : EN;
}
