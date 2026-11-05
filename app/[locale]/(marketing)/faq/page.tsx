import type { Metadata } from "next";

import { FaqPageContent } from "@/components/marketing/faq-page-content";
import { JsonLd } from "@/components/seo/json-ld";
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
            "Answers about the ASIP program, applications, and partnerships.",
        },
  );
}

export default async function Page({ params }: PageProps) {
  const locale = await localeFromParams(params);
  const copy = marketingCopyFor(locale, "faq");

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: copy.cards.map((card) => ({
            "@type": "Question",
            name: card.title,
            acceptedAnswer: {
              "@type": "Answer",
              text: card.description,
            },
          })),
        }}
      />
      <FaqPageContent locale={locale} copy={copy} />
    </main>
  );
}
