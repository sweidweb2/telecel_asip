import type { Metadata } from "next";

import { ContactExperience } from "@/components/marketing/contact-experience";
import { contactLabelsFor } from "@/components/marketing/contact-labels";
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
          path: "/contact",
          title: "Contacter ASIP | Commencez par la bonne conversation",
          description:
            "Choisissez le parcours qui correspond le mieux à votre besoin : fondateur, investisseur ou partenaire, presse ou demande générale.",
        }
      : {
          locale,
          path: "/contact",
          title: "Contact ASIP | Start with the right conversation",
          description:
            "Choose a founder, partner, media or general enquiry route and the ASIP team will direct it to the relevant owner.",
        },
  );
}

export default async function ContactPage({ params }: PageProps) {
  const locale = await localeFromParams(params);
  return (
    <ContactExperience locale={locale} labels={contactLabelsFor(locale)} />
  );
}
