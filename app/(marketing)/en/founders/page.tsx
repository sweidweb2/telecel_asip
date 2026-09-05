import { PortfolioPageContent } from "@/components/marketing/portfolio-page-content";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
import {
  parseActiveStartupFilters,
  parsePortfolioPageParam,
} from "@/validations/startup";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/founders",
  title: "ASIP Founders | Cohorts, Sectors and Markets",
  description:
    "Explore African technology founders supported by ASIP across cohorts, countries, sectors and outcomes.",
});

type PageProps = {
  searchParams: Promise<{ page?: string; year?: string; q?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <PortfolioPageContent
      page={parsePortfolioPageParam(params.page)}
      filters={parseActiveStartupFilters(params)}
    />
  );
}
