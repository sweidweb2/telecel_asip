import Link from "next/link";
import Image from "next/image";

import { buttonVariants } from "@/components/ui/button";
import {
  HOME_HERO_POSTER_SRC,
  HOME_HERO_VIDEO_SRC,
} from "@/constants/home-copy";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type { HomePageCopy } from "@/types/marketing-page";
import { cn } from "@/lib/utils";

type HomeHeroProps = {
  locale: Locale;
  copy: HomePageCopy["hero"];
};

export function HomeHero({ locale, copy }: HomeHeroProps) {
  return (
    <section className="relative isolate flex min-h-[min(92svh,52rem)] items-center overflow-hidden bg-foreground">
      <div className="absolute inset-0" aria-hidden>
        <div className="home-hero-motion absolute -inset-[12%] bg-[radial-gradient(ellipse_at_20%_20%,var(--brand-mid)_0%,transparent_52%),radial-gradient(ellipse_at_80%_0%,var(--brand)_0%,transparent_48%),radial-gradient(ellipse_at_70%_80%,var(--brand-soft)_0%,transparent_46%)] opacity-70" />
        {HOME_HERO_POSTER_SRC ? (
          <Image
            src={HOME_HERO_POSTER_SRC}
            alt=""
            fill
            priority
            className="object-cover md:hidden motion-reduce:md:block"
            sizes="100vw"
          />
        ) : null}
        {HOME_HERO_VIDEO_SRC ? (
          <video
            className="absolute inset-0 hidden size-full object-cover md:block motion-reduce:hidden"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={HOME_HERO_POSTER_SRC ?? undefined}
          >
            <source src={HOME_HERO_VIDEO_SRC} type="video/mp4" />
          </video>
        ) : null}
        <div className="absolute inset-0 bg-linear-to-t from-foreground via-foreground/75 to-foreground/35 sm:bg-linear-to-r sm:from-foreground sm:via-foreground/70 sm:to-foreground/25" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <p className="max-w-xl text-xs font-semibold uppercase tracking-[0.16em] text-brand-soft sm:text-sm">
          {copy.eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl font-heading text-3xl font-semibold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
          {copy.title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:mt-6 sm:text-lg sm:leading-8">
          {copy.description}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={publicPath(locale, copy.primaryCta.slug)}
            className={cn(
              buttonVariants({ size: "lg" }),
              "min-h-11 w-full sm:w-auto",
            )}
          >
            {copy.primaryCta.label}
          </Link>
          <Link
            href={publicPath(locale, copy.secondaryCta.slug)}
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "min-h-11 w-full border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto",
            )}
          >
            {copy.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
