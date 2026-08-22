import type { PublicPageSlug } from "@/constants/public-pages";

export type MarketingContentSlug = Exclude<
  PublicPageSlug,
  "contact" | "insights"
>;

export type MarketingPageCopy = {
  eyebrow: string;
  title: string;
  description: string;
  notice: string;
  sectionTitle: string;
  sectionDescription: string;
  cards: { title: string; description: string }[];
  cta?: { slug: PublicPageSlug; label: string };
};
