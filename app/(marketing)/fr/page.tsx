import { HomePageContent } from "@/components/marketing/home-page-content";
import { homeCopyFor } from "@/constants/home-copy";
import { getLatestInsights } from "@/data/insights";
import { getSpotlightStartups } from "@/data/startups";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/",
  title: "ASIP | Fondateurs africains, technologie et impact",
  description:
    "ASIP, par le Groupe Telecel, relie les fondateurs technologiques africains à l’expertise, aux voies de capital, aux marchés et aux partenaires pour bâtir et faire croître des entreprises solides.",
});

export default async function Page() {
  const [founders, articles] = await Promise.all([
    getSpotlightStartups(5),
    getLatestInsights("fr", 3),
  ]);

  return (
    <HomePageContent
      locale="fr"
      copy={homeCopyFor("fr")}
      founders={founders}
      articles={articles}
    />
  );
}
