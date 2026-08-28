import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/partners",
  title: "Partenaires — ASIP",
  description:
    "Partenaires, mentors et façons de collaborer avec l’écosystème ASIP.",
});

export default function Page() {
  return <MarketingContentPage locale="fr" slug="partners" />;
}
