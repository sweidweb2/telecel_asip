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
          title: "Conditions d’utilisation — ASIP",
          description:
            "Conditions d’utilisation provisoires du site du Programme africain d’initiative pour les startups.",
        }
      : {
          locale,
          path: "/terms",
          title: "Terms of Service — ASIP",
          description:
            "Draft terms of service for the Africa Startup Initiative Program website.",
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
