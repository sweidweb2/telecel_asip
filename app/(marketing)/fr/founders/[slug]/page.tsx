import { notFound } from "next/navigation";

import { StartupDetailPageContent } from "@/components/marketing/startup-detail-page-content";
import {
  getActiveStartupBySlug,
  getActiveStartupSlugRows,
  getRelatedActiveStartups,
} from "@/data/startups";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
import { parsePortfolioPageParam } from "@/validations/startup";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fromPage?: string }>;
};

export async function generateStaticParams() {
  const rows = await getActiveStartupSlugRows();
  return rows.map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const startup = await getActiveStartupBySlug(slug);

  if (!startup) {
    return { title: "Startup introuvable — ASIP" };
  }

  return buildMarketingMetadata({
    locale: "fr",
    path: `/founders/${slug}`,
    title: `${startup.name} — ASIP`,
    description: startup.description,
    image: startup.logo_url || undefined,
  });
}

export default async function FrFounderStartupPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const fromPage = parsePortfolioPageParam(query.fromPage);
  const [startup, related] = await Promise.all([
    getActiveStartupBySlug(slug),
    getRelatedActiveStartups(slug, 3),
  ]);
  if (!startup) notFound();

  return (
    <StartupDetailPageContent
      locale="fr"
      startup={startup}
      related={related}
      fromPage={fromPage}
    />
  );
}
