import type { Metadata } from "next";

import { AlumniPageContent } from "@/components/marketing/alumni-page-content";
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
          path: "/alumni",
          title: "Alumni — ASIP",
          description:
            "ASIP construit une expérience alumni plus solide, conçue pour garder les fondateurs connectés au-delà du programme formel.",
          noIndex: true,
        }
      : {
          locale,
          path: "/alumni",
          title: "Alumni — ASIP",
          description:
            "ASIP is building a stronger alumni experience designed to keep founders connected beyond the formal programme.",
          noIndex: true,
        },
  );
}

export default async function Page({ params }: PageProps) {
  const locale = await localeFromParams(params);
  return <AlumniPageContent locale={locale} />;
}
