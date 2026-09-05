import type { Metadata } from "next";

import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { getOpenApplications } from "@/data/settings";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const openApplications = await getOpenApplications();
  return buildMarketingMetadata({
    locale: "en",
    path: "/apply",
    title: "Apply — ASIP",
    description: "Prepare and share your ASIP venture profile.",
    // Index only when applications are formally open; page stays reachable either way.
    noIndex: !openApplications,
  });
}

export default function Page() {
  return <MarketingContentPage locale="en" slug="apply" />;
}
