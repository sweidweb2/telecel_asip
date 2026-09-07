import type { Metadata } from "next";

import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { getOpenApplications } from "@/data/settings";
import { localeFromParams } from "@/lib/i18n/locale-params";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await localeFromParams(params);
  const openApplications = await getOpenApplications();
  return buildMarketingMetadata(
    locale === "fr"
      ? {
          locale,
          path: "/apply",
          title: "Candidater — ASIP",
          description:
            "Préparez et présentez le profil de votre entreprise à ASIP.",
          noIndex: !openApplications,
        }
      : {
          locale,
          path: "/apply",
          title: "Apply — ASIP",
          description: "Prepare and share your ASIP venture profile.",
          // Index only when applications are formally open; page stays reachable either way.
          noIndex: !openApplications,
        },
  );
}

export default async function Page({ params }: PageProps) {
  const locale = await localeFromParams(params);
  return <MarketingContentPage locale={locale} slug="apply" />;
}
