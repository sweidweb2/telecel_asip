import { notFound } from "next/navigation";

import { StartupDetailPageContent } from "@/components/marketing/startup-detail-page-content";
import { getPublishedFounderStoryByStartupId } from "@/data/founder-stories";
import {
  getActiveStartupBySlug,
  getActiveStartupSlugRows,
  getRelatedActiveStartups,
} from "@/data/startups";
import { safePrerenderList } from "@/lib/prerender-safe";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
import { parsePortfolioPageParam } from "@/validations/startup";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fromPage?: string }>;
};

export async function generateStaticParams() {
  const rows = await safePrerenderList("en founder slugs", () =>
    getActiveStartupSlugRows(),
  );
  return rows.map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const startup = await getActiveStartupBySlug(slug);

  if (!startup) {
    return { title: "Startup not found — ASIP" };
  }

  return buildMarketingMetadata({
    locale: "en",
    path: `/founders/${slug}`,
    title: `${startup.name} — ASIP`,
    description: startup.description,
    image: startup.logo_url || undefined,
  });
}

export default async function EnFounderStartupPage({
  params,
  searchParams,
}: PageProps) {
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
      locale="en"
      startup={startup}
      related={related}
      story={story}
      fromPage={fromPage}
    />
  );
}
