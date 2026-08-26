import { PortfolioPageContent } from "@/components/marketing/portfolio-page-content";
import { marketingCopyFor } from "@/constants/marketing-copy";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
import { parsePortfolioYearParam } from "@/validations/startup";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/portfolio",
  title: "Portefeuille — ASIP",
  description: "Découvrez les entreprises de l’écosystème ASIP.",
});

type PageProps = {
  searchParams: Promise<{ year?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const year = parsePortfolioYearParam(params.year);

  return (
    <PortfolioPageContent
      locale="fr"
      copy={marketingCopyFor("fr", "portfolio")}
      initialYear={year ?? "all"}
    />
  );
}
