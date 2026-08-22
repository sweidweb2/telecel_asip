import { ContactForm } from "@/components/marketing/contact-form";
import { ContactInfoCard } from "@/components/marketing/contact-info-card";
import type { ContactLabels } from "@/components/marketing/contact-labels";

type ContactSectionProps = {
  labels: ContactLabels;
};

export function ContactSection({ labels }: ContactSectionProps) {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5 lg:gap-8">
      <ContactInfoCard labels={labels} />
      <ContactForm labels={labels} />
    </div>
  );
}
