import { PartnersPageContent } from "@/components/marketing/partners-page-content";
import { partnersCopyFor } from "@/constants/partners-copy";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/partners",
  title: "Devenir partenaire d’ASIP | Rencontrer les fondateurs africains",
  description:
    "Travaillez avec ASIP pour relier les fondateurs africains à l’expertise, à la technologie, au capital, à l’accès marché et à des opportunités concrètes.",
});

export default function Page() {
  return (
    <PartnersPageContent locale="fr" copy={partnersCopyFor("fr")} />
  );
}
