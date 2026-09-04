import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { MARKETING_MEDIA } from "@/constants/marketing-media";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type { HomePageCopy } from "@/types/marketing-page";
import { cn } from "@/lib/utils";

type HomeHeroProps = {
  locale: Locale;
  copy: HomePageCopy["hero"];
};

export function HomeHero({ locale, copy }: HomeHeroProps) {
  const media = MARKETING_MEDIA.home;
  const signals =
    locale === "fr"
      ? ["Mené par les fondateurs", "Connecté aux marchés", "Construit en Afrique"]
      : ["Founder-led", "Market-connected", "Built across Africa"];

  return (
    <section className="relative isolate flex min-h-[calc(100svh-4.75rem)] items-end overflow-hidden bg-[#14333b] md:min-h-[calc(100svh-8rem)]">
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={media.src}
          alt=""
          fill
          priority
          className="home-hero-motion object-cover"
          style={{ objectPosition: media.position }}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,51,59,.98)_0%,rgba(20,51,59,.9)_38%,rgba(20,51,59,.25)_76%,rgba(20,51,59,.08)_100%)]" />
      </div>

      <div data-hero-copy className="relative z-10 mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        <div className="flex items-center gap-4 text-xs font-semibold uppercase text-[#9ad1bf] sm:text-sm">
          <span>2019</span>
          <span className="h-px w-16 bg-[#9ad1bf]/55" />
          <p className="max-w-xl">{copy.eyebrow}</p>
        </div>
        <h1 className="mt-6 max-w-6xl font-heading text-[clamp(3.6rem,7.3vw,7.2rem)] font-semibold leading-[0.91] text-balance text-white">
          {copy.title}
        </h1>
        <div className="mt-9 grid gap-8 lg:grid-cols-12 lg:items-end">
          <p className="max-w-2xl border-l-2 border-[#dc395f] pl-5 text-lg leading-8 text-white/80 sm:text-xl lg:col-span-7">
            {copy.description}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:col-span-5 lg:justify-end">
            <Link
              href={publicPath(locale, copy.primaryCta.slug)}
              className={cn(buttonVariants({ size: "lg" }), "min-h-12 w-full bg-[#dc395f] text-white hover:bg-[#f04b70] sm:w-auto")}
            >
              {copy.primaryCta.label}
            </Link>
            <Link
              href={publicPath(locale, copy.secondaryCta.slug)}
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "min-h-12 w-full border-white/55 bg-white/5 text-white hover:bg-white hover:text-[#14333b] sm:w-auto",
              )}
            >
              {copy.secondaryCta.label}
            </Link>
          </div>
        </div>

        <div className="mt-12 grid max-w-4xl grid-cols-1 border-y border-white/25 sm:grid-cols-3">
          {signals.map((signal, index) => (
            <div
              key={signal}
              className="flex min-h-14 items-center gap-3 border-white/20 py-3 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0"
            >
              <span className="font-heading text-xs font-semibold text-[#9ad1bf]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-semibold text-white">{signal}</span>
            </div>
          ))}
        </div>
        <span className="sr-only">{media.alt[locale]}</span>
      </div>
    </section>
  );
}
