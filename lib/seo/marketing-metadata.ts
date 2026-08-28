import type { Metadata } from "next";

import type { Locale } from "@/constants/locales";
import { pageAlternates, pageOpenGraph } from "@/lib/seo/alternates";

type BuildMarketingMetadataInput = {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  /** Absolute or root-relative image URL for OG/Twitter. */
  image?: string;
  /** Use Open Graph article type (insight detail pages). */
  ogType?: "website" | "article";
  /** Routable but unlaunched pages (alumni, apply) stay out of the index. */
  noIndex?: boolean;
};

export function buildMarketingMetadata({
  locale,
  path,
  title,
  description,
  image,
  ogType = "website",
  noIndex = false,
}: BuildMarketingMetadataInput): Metadata {
  const imageUrl = image?.trim() || "/opengraph-image.png";

  return {
    title,
    description,
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    alternates: pageAlternates(locale, path),
    openGraph: {
      ...pageOpenGraph(locale, path, title, description, imageUrl),
      type: ogType,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
