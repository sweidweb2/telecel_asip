import { notFound } from "next/navigation";

import { StartupDetailPageContent } from "@/components/marketing/startup-detail-page-content";
import {
  getActiveStartupBySlug,
  getActiveStartupSlugRows,
} from "@/data/startups";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
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
    path: `/portfolio/${slug}`,
    title: `${startup.name} — ASIP`,
    description: startup.description,
    image: startup.logo_url || undefined,
  });
}

export default async function FrPortfolioStartupPage({ params }: PageProps) {
  const { slug } = await params;
  const startup = await getActiveStartupBySlug(slug);
  if (!startup) notFound();

  return <StartupDetailPageContent locale="fr" startup={startup} />;
}
