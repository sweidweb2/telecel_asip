import { ProgrammePageContent } from "@/components/marketing/programme-page-content";
import { programmeCopyFor } from "@/constants/programme-copy";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/programme",
  title: "ASIP Programme | How It Works",
  description:
    "Explore the ASIP founder journey, benefits, eligibility, selection process and current application status.",
});

export default function Page() {
  return (
    <ProgrammePageContent locale="en" copy={programmeCopyFor("en")} />
  );
}
