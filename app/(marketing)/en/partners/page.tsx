import { PartnersPageContent } from "@/components/marketing/partners-page-content";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/partners",
  title: "Partner with ASIP | Connect with African Founders",
  description:
    "Work with ASIP to connect African founders with expertise, technology, capital, market access and practical opportunities.",
});

export default function Page() {
  return <PartnersPageContent />;
}
