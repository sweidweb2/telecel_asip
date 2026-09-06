import Link from "next/link";

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
 * Alumni page hero — simple intro section (no full-bleed media).
 */
export function AlumniHeroSection({
  locale,
  copy,
  className,
}: AlumniHeroSectionProps) {
  const ctaHref = publicPath(locale, copy.primaryCta.slug);

  return (
    <section
      aria-labelledby="alumni-hero-heading"
      className={cn(
        "border-b border-border bg-background",
        "px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {copy.eyebrow}
        </p>
        <h1
          id="alumni-hero-heading"
          className="mt-3 max-w-3xl font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl"
        >
          {copy.title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8">
          {copy.description}
        </p>
        <Link
          href={ctaHref}
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-7 inline-flex min-h-11 w-full rounded-full px-8 sm:mt-8 sm:w-auto",
          )}
        >
          {copy.primaryCta.label}
        </Link>
      </div>
    </section>
  );
}
