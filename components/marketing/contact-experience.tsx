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
        <div className="mb-8 max-w-3xl sm:mb-10">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {labels.pageTitle}
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            {labels.pageDescription}
          </p>
        </div>
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
