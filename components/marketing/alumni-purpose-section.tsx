import Image from "next/image";

import { MARKETING_MEDIA } from "@/constants/marketing-media";
import type { Locale } from "@/constants/locales";
import { cn } from "@/lib/utils";
import type { AlumniPageCopy } from "@/types/marketing-page";

type AlumniPurposeSectionProps = {
  locale: Locale;
  copy: AlumniPageCopy["purpose"];
  className?: string;
};

/**
 * Alumni purpose — one idea: why the network exists after the cohort.
 * Split layout mirrors Partners proposition; image uses founders community media.
 */
export function AlumniPurposeSection({
  locale,
  copy,
  className,
}: AlumniPurposeSectionProps) {
  const media = MARKETING_MEDIA.founders;

  return (
    <section
      id="purpose"
      aria-labelledby="alumni-purpose-heading"
      className={cn(
        "border-b border-border bg-background",
        "px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20",
        className,
      )}
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="min-w-0 lg:col-span-5" data-reveal="fade">
          <span
            className="mb-4 block h-0.5 w-10 bg-[#dc395f] sm:mb-5"
            aria-hidden
          />
          <h2
            id="alumni-purpose-heading"
            className="font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl"
          >
            {copy.title}
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8">
            {copy.description}
          </p>
        </div>

        <div
          className="relative min-h-[16rem] overflow-hidden rounded-sm bg-[#14333b] sm:min-h-[20rem] lg:col-span-7 lg:min-h-[24rem]"
          data-reveal="media"
        >
          <Image
            src={media.src}
            alt={media.alt[locale]}
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
            style={{ objectPosition: media.position }}
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
