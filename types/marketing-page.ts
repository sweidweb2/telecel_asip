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
  /** FAQ page — tabbed question groups below the scroller. */
  tabsSectionTitle?: string;
  tabsSectionDescription?: string;
  tabs?: {
    id: string;
    label: string;
    items: { title: string; description: string }[];
  }[];
  /** FAQ page — dedicated CTA block at the bottom. */
  ctaSection?: {
    title: string;
    description: string;
    slug: PublicPageSlug;
    label: string;
  };
};
