import type { Metadata } from "next";

import { PartnersPageContent } from "@/components/marketing/partners-page-content";
import { getPublicPartners } from "@/data/partners";
import { localeFromParams } from "@/lib/i18n/locale-params";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await localeFromParams(params);
  return buildMarketingMetadata(
    locale === "fr"
      ? {
          locale,
          path: "/partners",
          title: "Investisseurs et partenaires ASIP | Portefeuille et collaboration",
          description:
            "Explorez le portefeuille ASIP, les partenaires de l’écosystème, l’activité en cours et les voies de collaboration en investissement, technologie et commerce.",
        }
      : {
          locale,
          path: "/partners",
          title: "ASIP Investors & Partners | Portfolio & Collaboration",
          description:
            "Explore ASIP's founder portfolio, ecosystem partners, current activity and routes for investment, technology and commercial collaboration.",
        },
  );
}

export default async function Page({ params }: PageProps) {
  const locale = await localeFromParams(params);
  const { active, historical } = await getPublicPartners();

  return (
    <PartnersPageContent
      locale={locale}
      active={active}
      historical={historical}
    />
  );
}
