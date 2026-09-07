import type { Metadata } from "next";

import { AboutPageContent } from "@/components/marketing/about-page-content";
import { marketingCopyFor } from "@/constants/marketing-copy";
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
          path: "/about",
          title:
            "À propos d’ASIP | De l’innovation africaine aux opportunités mondiales",
          description:
            "Découvrez l’origine d’ASIP en 2019, sa mission et son parcours pour relier les fondateurs technologiques africains à l’expertise, aux marchés et aux opportunités.",
        }
      : {
          locale,
          path: "/about",
          title: "About ASIP | From African Innovation to Global Opportunity",
          description:
            "Discover ASIP’s 2019 origin, mission and journey helping African technology founders connect to expertise, markets and opportunity.",
        },
  );
}

export default async function Page({ params }: PageProps) {
  const locale = await localeFromParams(params);
  return (
    <AboutPageContent locale={locale} copy={marketingCopyFor(locale, "about")} />
  );
}
