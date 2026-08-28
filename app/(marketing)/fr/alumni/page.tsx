import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/alumni",
  title: "Réseau alumni — ASIP",
  description:
    "Le réseau alumni d’ASIP garde les fondateurs connectés à leurs pairs, aux mentors et aux opportunités après leur cohorte.",
  noIndex: true,
});

export default function Page() {
  return <MarketingContentPage locale="fr" slug="alumni" />;
}
