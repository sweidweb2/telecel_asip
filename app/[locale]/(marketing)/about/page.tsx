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
            "Découvrez la mission d’ASIP et son parcours, de la première cohorte d’accélération au prochain chapitre, aux côtés des fondateurs technologiques africains.",
        }
      : {
          locale,
          path: "/about",
          title: "About ASIP | From African Innovation to Global Opportunity",
          description:
            "Discover ASIP’s mission and journey, from the first accelerator cohort to the next chapter, backing African technology founders with expertise, markets and relationships.",
        },
  );
}

export default async function Page({ params }: PageProps) {
  const locale = await localeFromParams(params);
  return (
    <AboutPageContent locale={locale} copy={marketingCopyFor(locale, "about")} />
  );
}
