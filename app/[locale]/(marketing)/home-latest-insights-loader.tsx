import { HomeLatestInsightsSection } from "@/components/marketing/home-latest-insights-section";
import { homeV2CopyFor } from "@/constants/home-v2-copy";
import type { Locale } from "@/constants/locales";
import { getLatestInsights } from "@/data/insights";

type HomeLatestInsightsLoaderProps = {
  locale: Locale;
};

/**
 * Below-fold home insights — own async boundary so the hero shell is not
 * blocked on the blogs list read. Lives next to the marketing home route
 * because it calls `data/`.
 */
export async function HomeLatestInsightsLoader({
  locale,
}: HomeLatestInsightsLoaderProps) {
  const articles = await getLatestInsights(locale, 8);
  const copy = homeV2CopyFor(locale);
  // Only populated, current content: no empty shell on the homepage.
  if (articles.length === 0) return null;

  return (
    <HomeLatestInsightsSection
      locale={locale}
      copy={copy.latest}
      articles={articles}
    />
  );
}
