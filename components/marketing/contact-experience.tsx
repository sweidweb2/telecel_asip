"use client";

import { useState } from "react";

import type { ContactLabels } from "@/components/marketing/contact-labels";
import { ContactSection } from "@/components/marketing/contact-section";
import { Section } from "@/components/marketing/page-elements";
import {
  DEFAULT_CONTACT_ENQUIRY_TYPE,
  type ContactEnquiryType,
} from "@/constants/contact-enquiry";
import type { Locale } from "@/constants/locales";

type ContactExperienceProps = {
  locale: Locale;
  labels: ContactLabels;
};

export function ContactExperience({ locale, labels }: ContactExperienceProps) {
  const [enquiryType, setEnquiryType] = useState<ContactEnquiryType>(
    DEFAULT_CONTACT_ENQUIRY_TYPE,
  );

  return (
    <main className="flex w-full flex-1 flex-col">
      <Section className="py-10 sm:py-14 lg:py-16">
        <ContactSection
          locale={locale}
          labels={labels}
          enquiryType={enquiryType}
          onEnquiryTypeChange={setEnquiryType}
        />
      </Section>
    </main>
  );
}
