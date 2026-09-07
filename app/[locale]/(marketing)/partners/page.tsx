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
          title: "Devenir partenaire d’ASIP | Rencontrer les fondateurs africains",
          description:
            "Travaillez avec ASIP pour relier les fondateurs africains à l’expertise, à la technologie, au capital, à l’accès marché et à des opportunités concrètes.",
        }
      : {
          locale,
          path: "/partners",
          title: "Partner with ASIP | Connect with African Founders",
          description:
            "Work with ASIP to connect African founders with expertise, technology, capital, market access and practical opportunities.",
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
