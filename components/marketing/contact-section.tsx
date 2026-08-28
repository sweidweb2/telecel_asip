import { ContactForm } from "@/components/marketing/contact-form";
import { ContactInfoCard } from "@/components/marketing/contact-info-card";
import type { ContactLabels } from "@/components/marketing/contact-labels";
import type { ContactEnquiryType } from "@/constants/contact-enquiry";
import type { Locale } from "@/constants/locales";

type ContactSectionProps = {
  locale: Locale;
  labels: ContactLabels;
  enquiryType: ContactEnquiryType;
  onEnquiryTypeChange: (value: ContactEnquiryType) => void;
};

export function ContactSection({
  locale,
  labels,
  enquiryType,
  onEnquiryTypeChange,
}: ContactSectionProps) {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5 lg:gap-8">
      <ContactInfoCard labels={labels} />
      <ContactForm
        locale={locale}
        labels={labels}
        enquiryType={enquiryType}
        onEnquiryTypeChange={onEnquiryTypeChange}
      />
    </div>
  );
}
