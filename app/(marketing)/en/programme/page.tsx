import { ProgrammePageContent } from "@/components/marketing/programme-page-content";
import { getPublishedCohorts } from "@/data/cohorts";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/programme",
  title: "ASIP Programme | How It Works",
  description:
    "Explore the ASIP founder journey, benefits, eligibility, selection process and current application status.",
});

export default async function Page() {
  const cohorts = await getPublishedCohorts();

  return <ProgrammePageContent locale="en" cohorts={cohorts} />;
}
