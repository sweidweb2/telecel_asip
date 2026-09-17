import { TreeCenteredHero } from "@/components/marketing/tree-centered-hero";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type { MarketingPageCopy } from "@/types/marketing-page";

type FoundersHeroSectionProps = {
  locale: Locale;
  copy: Pick<
    MarketingPageCopy,
    "eyebrow" | "title" | "description" | "cta"
  >;
  className?: string;
};

/**
 * Founders directory hero — same centered tree composition as Programme,
 * on the primary ink surface instead of light.
 */
export function FoundersHeroSection({
  locale,
  copy,
  className,
}: FoundersHeroSectionProps) {
  const primaryCta =
    copy.cta != null
      ? {
          href: publicPath(locale, copy.cta.slug),
          label: copy.cta.label,
        }
      : undefined;

  return (
    <TreeCenteredHero
      tone="primary"
      patternId="founders-hero-tree-tile"
      density="compact"
      headingId="founders-hero-heading"
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      primaryCta={primaryCta}
      className={className}
    />
  );
}
