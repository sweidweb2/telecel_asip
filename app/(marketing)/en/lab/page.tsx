import { LabPageContent } from "@/components/marketing/lab-page-content";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/lab",
  title: "Sections lab — ASIP",
  description: "Temporary playground for marketing sections.",
  noIndex: true,
});

export default function Page() {
  return <LabPageContent locale="en" />;
}
