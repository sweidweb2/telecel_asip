import { PartnersPageContent } from "@/components/marketing/partners-page-content";
import { getPublicPartners } from "@/data/partners";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/partners",
  title: "Partner with ASIP | Connect with African Founders",
  description:
    "Work with ASIP to connect African founders with expertise, technology, capital, market access and practical opportunities.",
});

export default async function Page() {
  const { active, historical } = await getPublicPartners();

  return (
    <PartnersPageContent
      locale="en"
      active={active}
      historical={historical}
    />
  );
}
