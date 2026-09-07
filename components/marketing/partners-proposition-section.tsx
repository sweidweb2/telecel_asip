import Image from "next/image";

import type { Locale } from "@/constants/locales";
import { cn } from "@/lib/utils";
import type { PartnersPageCopy } from "@/types/marketing-page";

type PartnersPropositionSectionProps = {
  locale: Locale;
  copy: PartnersPageCopy["proposition"];
  className?: string;
};

/**
 * Partner proposition — one clear ask: bring a real opportunity, get a usable route.
 */
export function PartnersPropositionSection({
  locale,
  copy,
  className,
}: PartnersPropositionSectionProps) {
  const stageAlt =
    locale === "fr"
      ? "Scène ASIP lors d’un événement partenaires"
      : "ASIP stage at a partners gathering";

  return (
    <section
      id="proposition"
      aria-labelledby="partners-proposition-heading"
      className={cn(
        "border-b border-border bg-background",
        "px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20",
        className,
      )}
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="min-w-0 lg:col-span-5">
          <h2
            id="partners-proposition-heading"
            className="font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl"
          >
            {copy.title}
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8">
            {copy.description}
          </p>
        </div>

        <div className="relative min-h-[16rem] overflow-hidden rounded-sm bg-[#14333b] sm:min-h-[20rem] lg:col-span-7 lg:min-h-[24rem]">
          <Image
            src="/asip-media/partners-stage.webp"
            alt={stageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover object-[center_42%]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(20,51,59,0.55)_100%)]"
          />
        </div>
      </div>
    </section>
  );
}
