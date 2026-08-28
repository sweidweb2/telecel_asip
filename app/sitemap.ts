import type { MetadataRoute } from "next";

import { LOCALES } from "@/constants/locales";
import { INDEXABLE_PAGE_SLUGS } from "@/constants/public-pages";
import { getInsightSlugRows } from "@/data/insights";
import { getActiveStartupSlugRows } from "@/data/startups";
import { safePrerenderList } from "@/lib/prerender-safe";
import { localeUrl } from "@/lib/seo/alternates";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const [insightRows, startupRows] = await Promise.all([
    safePrerenderList("sitemap insight slugs", () => getInsightSlugRows()),
    safePrerenderList("sitemap startup slugs", () => getActiveStartupSlugRows()),
  ]);

  for (const locale of LOCALES) {
    for (const slug of INDEXABLE_PAGE_SLUGS) {
      const path = slug === "" ? "/" : `/${slug}`;
      entries.push({
        url: localeUrl(locale, path),
        changeFrequency: slug === "insights" ? "weekly" : "monthly",
        priority: slug === "" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((loc) => [loc, localeUrl(loc, path)]),
          ),
        },
      });
    }

    for (const row of insightRows) {
      const path = `/insights/${row.slug}`;
      entries.push({
        url: localeUrl(locale, path),
        lastModified: row.updated_at ? new Date(row.updated_at) : undefined,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((loc) => [loc, localeUrl(loc, path)]),
          ),
        },
      });
    }

    for (const row of startupRows) {
      const path = `/founders/${row.slug}`;
      entries.push({
        url: localeUrl(locale, path),
        lastModified: row.updated_at ? new Date(row.updated_at) : undefined,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((loc) => [loc, localeUrl(loc, path)]),
          ),
        },
      });
    }
  }

  return entries;
}
