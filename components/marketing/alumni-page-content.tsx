import { AlumniBenefitsSection } from "@/components/marketing/alumni-benefits-section";
import { AlumniHeroSection } from "@/components/marketing/alumni-hero-section";
import { AlumniNoticeSection } from "@/components/marketing/alumni-notice-section";
import { AlumniPurposeSection } from "@/components/marketing/alumni-purpose-section";
import { PageCtaSection } from "@/components/marketing/page-cta-section";
import type { Locale } from "@/constants/locales";
import { alumniCopyFor } from "@/constants/alumni-copy";

type AlumniPageContentProps = {
  locale: Locale;
};

/**
 * Alumni marketing page — Eleanor-validated static copy.
 * Routable and in nav; keep noindex until the operating model is confirmed.
 * Phase 1: no login or member platform — CTA opens the public founders directory.
 */
export function AlumniPageContent({ locale }: AlumniPageContentProps) {
  const copy = alumniCopyFor(locale);

  return (
    <main>
      <AlumniHeroSection locale={locale} copy={copy.hero} />
      <AlumniPurposeSection locale={locale} copy={copy.purpose} />
      <AlumniBenefitsSection copy={copy.benefits} />
      <AlumniNoticeSection notice={copy.notice} />
      <PageCtaSection locale={locale} cta={copy.ctaSection} />
    </main>
  );
}
