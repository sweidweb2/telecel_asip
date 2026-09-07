import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StartupDetailPageContent } from "@/components/marketing/startup-detail-page-content";
import { getPublishedFounderStoryByStartupId } from "@/data/founder-stories";
import {
  getActiveStartupBySlug,
  getActiveStartupSlugRows,
  getRelatedActiveStartups,
} from "@/data/startups";
import { localeFromParams } from "@/lib/i18n/locale-params";
import { safePrerenderList } from "@/lib/prerender-safe";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
import { parsePortfolioPageParam } from "@/validations/startup";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ fromPage?: string }>;
};

export async function generateStaticParams() {
  const rows = await safePrerenderList("founder slugs", () =>
    getActiveStartupSlugRows(),
  );
  return rows.map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await localeFromParams(params);
  const { slug } = await params;
  const startup = await getActiveStartupBySlug(slug);

  if (!startup) {
    return {
      title:
        locale === "fr" ? "Startup introuvable — ASIP" : "Startup not found — ASIP",
    };
  }

  return buildMarketingMetadata({
    locale,
    path: `/founders/${slug}`,
    title: `${startup.name} — ASIP`,
    description: startup.description,
    image: startup.logo_url || undefined,
  });
}

export default async function FounderStartupPage({
  params,
  searchParams,
}: PageProps) {
  const locale = await localeFromParams(params);
  const { slug } = await params;
  const query = await searchParams;
  const fromPage = parsePortfolioPageParam(query.fromPage);
  const startup = await getActiveStartupBySlug(slug);
  if (!startup) notFound();

  const [related, story] = await Promise.all([
    getRelatedActiveStartups(slug, 3),
    getPublishedFounderStoryByStartupId(startup.id),
  ]);

  return (
    <StartupDetailPageContent
      locale={locale}
      startup={startup}
      related={related}
      story={story}
      fromPage={fromPage}
    />
  );
}
