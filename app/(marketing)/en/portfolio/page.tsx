import { PortfolioPageContent } from "@/components/marketing/portfolio-page-content";
import { marketingCopyFor } from "@/constants/marketing-copy";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
import { parsePortfolioYearParam } from "@/validations/startup";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/portfolio",
  title: "Portfolio — ASIP",
  description: "Discover ventures across the ASIP ecosystem.",
});

type PageProps = {
  searchParams: Promise<{ year?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const year = parsePortfolioYearParam(params.year);

  return (
    <PortfolioPageContent
      locale="en"
      copy={marketingCopyFor("en", "portfolio")}
      initialYear={year ?? "all"}
    />
  );
}
