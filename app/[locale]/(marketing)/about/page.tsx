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
            "À propos d’ASIP | Programme fondateurs du Groupe Telecel",
          description:
            "Découvrez l’origine d’ASIP en 2019, sa raison d’être centrée sur les fondateurs et son parcours aux côtés d’entreprises technologiques sur les marchés africains.",
        }
      : {
          locale,
          path: "/about",
          title: "About ASIP | Founder Program by Telecel Group",
          description:
            "Discover ASIP's 2019 origin, founder-first purpose and journey supporting technology ventures across African markets.",
        },
  );
}

export default async function Page({ params }: PageProps) {
  const locale = await localeFromParams(params);
  return (
    <AboutPageContent locale={locale} copy={marketingCopyFor(locale, "about")} />
  );
}
