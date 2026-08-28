import { AboutPageContent } from "@/components/marketing/about-page-content";
import { marketingCopyFor } from "@/constants/marketing-copy";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/about",
  title: "À propos d’ASIP | De l’innovation africaine aux opportunités mondiales",
  description:
    "Découvrez l’origine d’ASIP en 2019, sa mission et son parcours pour relier les fondateurs technologiques africains à l’expertise, aux marchés et aux opportunités.",
});

export default function Page() {
  return <AboutPageContent locale="fr" copy={marketingCopyFor("fr", "about")} />;
}
