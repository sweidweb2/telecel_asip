import { LabPageContent } from "@/components/marketing/lab-page-content";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/lab",
  title: "Labo de sections — ASIP",
  description: "Espace temporaire pour sections marketing.",
  noIndex: true,
});

export default function Page() {
  return <LabPageContent locale="fr" />;
}
