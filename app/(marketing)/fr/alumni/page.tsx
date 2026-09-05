import { AlumniPageContent } from "@/components/marketing/alumni-page-content";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/alumni",
  title: "Alumni — ASIP",
  description:
    "ASIP construit une expérience alumni plus solide, conçue pour garder les fondateurs connectés au-delà du programme formel.",
  noIndex: true,
});

export default function Page() {
  return <AlumniPageContent />;
}
