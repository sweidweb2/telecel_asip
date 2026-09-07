import Link from "next/link";

import { InstitutionalHero } from "@/components/marketing/institutional-hero";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { AlumniPageCopy } from "@/types/marketing-page";

type AlumniHeroSectionProps = {
  locale: Locale;
  copy: AlumniPageCopy["hero"];
  className?: string;
};

/**
 * Alumni page hero — institutional night panel + founders CTA.
 */
export function AlumniHeroSection({
  locale,
  copy,
  className,
}: AlumniHeroSectionProps) {
  const ctaHref = publicPath(locale, copy.primaryCta.slug);

  return (
    <InstitutionalHero
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      headingId="alumni-hero-heading"
      patternId="alumni-hero"
      composition="horizon"
      className={className}
      action={
        <Link
          href={ctaHref}
          className={cn(
            buttonVariants({ size: "lg" }),
            "inline-flex min-h-11 w-full rounded-full px-8 sm:w-auto",
          )}
        >
          {copy.primaryCta.label}
        </Link>
      }
    />
  );
}
