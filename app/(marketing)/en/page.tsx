import { HomePageContent } from "@/components/marketing/home-page-content";
import { homeCopyFor } from "@/constants/home-copy";
import { getLatestInsights } from "@/data/insights";
import { getSpotlightStartups } from "@/data/startups";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/",
  title: "ASIP | African Founders, Technology & Impact",
  description:
    "ASIP by Telecel Group connects African technology founders to expertise, capital pathways, markets and partners to build and scale strong businesses.",
});

export default async function Page() {
  const [founders, articles] = await Promise.all([
    getSpotlightStartups(5),
    getLatestInsights("en", 3),
  ]);

  return (
    <HomePageContent
      locale="en"
      copy={homeCopyFor("en")}
      founders={founders}
      articles={articles}
    />
  );
}
