import type { Metadata } from "next";

import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
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
          path: "/faq",
          title: "FAQ - ASIP",
          description:
            "Réponses sur le programme ASIP, les candidatures et les partenariats.",
        }
      : {
          locale,
          path: "/faq",
          title: "FAQ - ASIP",
          description:
            "Answers about the ASIP programme, applications, and partnerships.",
        },
  );
}

export default async function Page({ params }: PageProps) {
  const locale = await localeFromParams(params);
  return <MarketingContentPage locale={locale} slug="faq" />;
}
