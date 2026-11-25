import type { Metadata } from "next";

import { LegalPageContent } from "@/components/marketing/legal-page-content";
import { legalCopyFor } from "@/constants/legal-copy";
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
          path: "/terms",
          title: "Conditions d’utilisation | ASIP",
          description:
            "Conditions d’utilisation du site ASIP : comptes, formulaires d’admission, contact et usage acceptable.",
        }
      : {
          locale,
          path: "/terms",
          title: "Terms of Service | ASIP",
          description:
            "Terms of service for the ASIP website: accounts, intake forms, contact, and acceptable use.",
        },
  );
}

export default async function Page({ params }: PageProps) {
  const locale = await localeFromParams(params);
  return (
    <LegalPageContent
      copy={legalCopyFor(locale, "terms")}
      composition="aurora"
      patternId="terms-hero"
    />
  );
}
