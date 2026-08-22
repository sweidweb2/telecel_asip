import type { MetadataRoute } from "next";

import { LOCALES } from "@/constants/locales";
import { PUBLIC_PAGE_SLUGS } from "@/constants/public-pages";
import { localeUrl } from "@/lib/seo/alternates";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const slug of PUBLIC_PAGE_SLUGS) {
      const path = slug === "" ? "/" : `/${slug}`;
      entries.push({
        url: localeUrl(locale, path),
        changeFrequency: slug === "insights" ? "weekly" : "monthly",
        priority: slug === "" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((loc) => [loc, localeUrl(loc, path)])
          ),
        },
      });
    }
  }

  return entries;
}
