import { PartnersPageContent } from "@/components/marketing/partners-page-content";
import { getPublicPartners } from "@/data/partners";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/partners",
  title: "Devenir partenaire d’ASIP | Rencontrer les fondateurs africains",
  description:
    "Travaillez avec ASIP pour relier les fondateurs africains à l’expertise, à la technologie, au capital, à l’accès marché et à des opportunités concrètes.",
});

export default async function Page() {
  const { active, historical } = await getPublicPartners();

  return (
    <PartnersPageContent
      locale="fr"
      active={active}
      historical={historical}
    />
  );
}
