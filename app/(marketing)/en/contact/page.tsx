import { ContactExperience } from "@/components/marketing/contact-experience";
import { contactLabelsFor } from "@/components/marketing/contact-labels";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/contact",
  title: "Contact us — ASIP",
  description:
    "Choose a founder, partner, media or general enquiry route and the ASIP team will direct it to the relevant owner.",
});

export default function EnContactPage() {
  return <ContactExperience locale="en" labels={contactLabelsFor("en")} />;
}
