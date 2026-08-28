"use client";

import { useRef, useState } from "react";

import type { ContactLabels } from "@/components/marketing/contact-labels";
import { ContactSection } from "@/components/marketing/contact-section";
import { PageHero, Section } from "@/components/marketing/page-elements";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_CONTACT_ENQUIRY_TYPE,
  type ContactEnquiryType,
} from "@/constants/contact-enquiry";
import type { Locale } from "@/constants/locales";

type ContactExperienceProps = {
  locale: Locale;
  labels: ContactLabels;
};

/** Hero shortcuts skip the catch-all route — it stays available in the form. */
const HERO_ROUTE_IDS: readonly ContactEnquiryType[] = [
  "founder",
  "partner",
  "media",
];

export function ContactExperience({ locale, labels }: ContactExperienceProps) {
  const [enquiryType, setEnquiryType] = useState<ContactEnquiryType>(
    DEFAULT_CONTACT_ENQUIRY_TYPE,
  );
  const formRef = useRef<HTMLDivElement>(null);

  function selectRoute(value: ContactEnquiryType) {
    setEnquiryType(value);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const heroRoutes = HERO_ROUTE_IDS.map((id) =>
    labels.routes.find((route) => route.id === id),
  ).filter((route) => route !== undefined);

  return (
    <main className="flex w-full flex-1 flex-col">
      <PageHero
        eyebrow={labels.heroEyebrow}
        title={labels.heroTitle}
        description={labels.heroDescription}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {heroRoutes.map((route) => (
            <Button
              key={route.id}
              type="button"
              variant={route.id === enquiryType ? "default" : "outline"}
              className="min-h-11 w-full sm:w-auto"
              onClick={() => selectRoute(route.id)}
            >
              {route.label}
            </Button>
          ))}
        </div>
      </PageHero>

      <Section className="py-10 sm:py-14 lg:py-16">
        <div ref={formRef} className="scroll-mt-24">
          <ContactSection
            locale={locale}
            labels={labels}
            enquiryType={enquiryType}
            onEnquiryTypeChange={setEnquiryType}
          />
        </div>
      </Section>
    </main>
  );
}
