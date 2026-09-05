import { PortfolioPageContent } from "@/components/marketing/portfolio-page-content";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
import {
  parseActiveStartupFilters,
  parsePortfolioPageParam,
} from "@/validations/startup";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/founders",
  title: "Fondateurs ASIP | Cohortes, secteurs et marchés",
  description:
    "Explorez les fondateurs technologiques africains accompagnés par ASIP par cohorte, pays, secteur et résultats.",
});

type PageProps = {
  searchParams: Promise<{ page?: string; year?: string; q?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <PortfolioPageContent
      locale="fr"
      page={parsePortfolioPageParam(params.page)}
      filters={parseActiveStartupFilters(params)}
    />
  );
}
