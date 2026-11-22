import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { MARKETING_MEDIA } from "@/constants/marketing-media";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { PartnersPageCopy } from "@/types/marketing-page";

type PartnersHeroSectionProps = {
  locale: Locale;
  copy: PartnersPageCopy["hero"];
  className?: string;
};

/**
 * Partners page hero — full-bleed ecosystem photograph, one headline, one CTA.
 */
export function PartnersHeroSection({
  locale,
  copy,
  className,
}: PartnersHeroSectionProps) {
  const media = MARKETING_MEDIA.partners;
  const ctaHref = publicPath(locale, copy.cta.slug);

  return (
    <section
      aria-labelledby="partners-hero-heading"
      className={cn("border-b border-border bg-asip-ink-night", className)}
    >
      <div className="relative isolate min-h-[min(78dvh,40rem)] overflow-hidden sm:min-h-[min(72dvh,42rem)]">
        <Image
          src={media.src}
          alt={media.alt[locale]}
          fill
          priority
          sizes="100vw"
          className="partners-hero-image object-cover"
          style={{ objectPosition: media.position }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(105deg,color-mix(in_srgb,var(--asip-ink-night)_92%,transparent)_0%,color-mix(in_srgb,var(--asip-ink)_78%,transparent)_42%,color-mix(in_srgb,var(--asip-ink)_45%,transparent)_68%,color-mix(in_srgb,var(--asip-ink)_28%,transparent)_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-asip-ink-night to-transparent"
        />

        <div className="relative z-10 mx-auto flex min-h-[min(78dvh,40rem)] w-full max-w-7xl flex-col justify-end px-4 pb-10 pt-28 sm:min-h-[min(72dvh,42rem)] sm:px-6 sm:pb-12 sm:pt-32 lg:px-8 lg:pb-14">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-asip-mint uppercase">
              {copy.eyebrow}
            </p>
            <h1
              id="partners-hero-heading"
              className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl lg:text-5xl lg:leading-[1.08]"
            >
              {copy.titleLead}{" "}
              <span className="partners-title-accent font-serif font-normal italic">
                {copy.titleAccent}
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:mt-6 sm:text-lg sm:leading-8">
              {copy.description}
            </p>
            <Link
              href={ctaHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-7 min-h-11 w-full rounded-full px-8 sm:mt-8 sm:w-auto",
              )}
            >
              {copy.cta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
