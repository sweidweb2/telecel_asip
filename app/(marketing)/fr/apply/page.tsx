import type { Metadata } from "next";

import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { getOpenApplications } from "@/data/settings";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const openApplications = await getOpenApplications();
  return buildMarketingMetadata({
    locale: "fr",
    path: "/apply",
    title: "Candidater — ASIP",
    description: "Préparez et présentez le profil de votre entreprise à ASIP.",
    noIndex: !openApplications,
  });
}

export default function Page() {
  return <MarketingContentPage locale="fr" slug="apply" />;
}
