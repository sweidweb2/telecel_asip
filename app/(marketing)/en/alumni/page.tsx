import { AlumniPageContent } from "@/components/marketing/alumni-page-content";
import { alumniCopyFor } from "@/constants/alumni-copy";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/alumni",
  title: "Alumni — ASIP",
  description:
    "ASIP is building a stronger alumni experience designed to keep founders connected beyond the formal programme.",
  noIndex: true,
});

export default function Page() {
  return <AlumniPageContent locale="en" copy={alumniCopyFor("en")} />;
}
