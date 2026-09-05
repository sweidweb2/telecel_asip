import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { MARKETING_MEDIA } from "@/constants/marketing-media";
import { publicPath } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { ImpactPageCopy } from "@/types/marketing-page";

type ImpactHeroProps = {
  locale: Locale;
  copy: ImpactPageCopy["hero"];
};

/**
 * Impact hero — calm credibility statement.
 * Theme tokens only: background / foreground / muted / primary.
 * Documentary photo clipped to a right-flush trapezoid
 * (narrower top, wider bottom) — never a colour wash.
 */
export function ImpactHero({ locale, copy }: ImpactHeroProps) {
  const media = MARKETING_MEDIA.impact;
  const ctaHref = publicPath(locale, copy.cta.slug);

  return (
    <section className="relative overflow-hidden border-b border-border bg-background text-foreground lg:min-h-[32rem]">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-36">
        <div
          data-hero-copy
          className="flex max-w-xl flex-col justify-center lg:max-w-[min(37.5rem,52%)]"
        >
          <span
            className="mb-7 block h-0.5 w-12 bg-primary sm:mb-8"
            aria-hidden
          />

          <h1 className="font-heading text-4xl font-bold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {copy.title}
          </h1>

          <p className="mt-5 max-w-[37.5rem] text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8">
            {copy.description}
          </p>

          <div className="mt-8 sm:mt-10">
            <Link
              href={ctaHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "min-h-11 w-full rounded-full px-8 sm:w-auto",
              )}
            >
              {copy.cta.label}
            </Link>
          </div>
        </div>
      </div>

      {/*
        Right-flush trapezoid: top edge shorter than bottom
        (narrow crown → wider base). Cover image fills the clipped shape.
      */}
      <div
        className={cn(
          "relative ml-auto h-56 w-[min(100%,24rem)] bg-muted sm:h-64 sm:w-[min(100%,30rem)]",
          "[clip-path:polygon(12%_0,100%_0,100%_100%,0_100%)]",
          "lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[min(44%,36rem)]",
          "lg:[clip-path:polygon(14%_0,100%_0,100%_100%,0_100%)]",
        )}
      >
        <Image
          src={media.src}
          alt={media.alt[locale]}
          fill
          priority
          loading="eager"
          className="object-cover opacity-90 saturate-[0.72] contrast-[0.96]"
          style={{ objectPosition: media.position }}
          sizes="(max-width: 1024px) 90vw, 44vw"
        />
      </div>
    </section>
  );
}
