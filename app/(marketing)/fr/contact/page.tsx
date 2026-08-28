import { ContactExperience } from "@/components/marketing/contact-experience";
import { contactLabelsFor } from "@/components/marketing/contact-labels";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/contact",
  title: "Nous contacter — ASIP",
  description:
    "Choisissez un parcours fondateur, partenaire, presse ou général : l’équipe ASIP transmettra votre demande au bon interlocuteur.",
});

export default function FrContactPage() {
  return <ContactExperience locale="fr" labels={contactLabelsFor("fr")} />;
}
