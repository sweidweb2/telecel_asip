import type { Metadata } from "next";

import type { Locale } from "@/constants/locales";
import { pageAlternates, pageOpenGraph } from "@/lib/seo/alternates";

type BuildMarketingMetadataInput = {
  locale: Locale;
  path: string;
  title: string;
  description: string;
};

export function buildMarketingMetadata({
  locale,
  path,
  title,
  description,
}: BuildMarketingMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: pageAlternates(locale, path),
    openGraph: pageOpenGraph(locale, path, title, description),
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image.png"],
    },
  };
}
