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
          path: "/privacy",
          title: "Politique de confidentialité — ASIP",
          description:
            "Politique de confidentialité ASIP : données collectées, cookies, formulaires et droits.",
        }
      : {
          locale,
          path: "/privacy",
          title: "Privacy Policy — ASIP",
          description:
            "ASIP privacy policy: data we collect, cookies, forms, processors, and your rights.",
        },
  );
}

export default async function Page({ params }: PageProps) {
  const locale = await localeFromParams(params);
  return (
    <LegalPageContent
      copy={legalCopyFor(locale, "privacy")}
      composition="ledger"
      patternId="privacy-hero"
    />
  );
}
