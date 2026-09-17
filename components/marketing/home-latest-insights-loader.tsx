import { HomeLatestInsightsSection } from "@/components/marketing/home-latest-insights-section";
import { homeCopyFor } from "@/constants/home-copy";
import type { Locale } from "@/constants/locales";
import { getLatestInsights } from "@/data/insights";

type HomeLatestInsightsLoaderProps = {
  locale: Locale;
};

/**
 * Below-fold home insights — own async boundary so the hero shell is not
 * blocked on the blogs list read.
 */
export async function HomeLatestInsightsLoader({
  locale,
}: HomeLatestInsightsLoaderProps) {
  const articles = await getLatestInsights(locale, 8);
  const copy = homeCopyFor(locale);

  return (
    <HomeLatestInsightsSection
      locale={locale}
      copy={copy.latest}
      articles={articles}
    />
  );
}
