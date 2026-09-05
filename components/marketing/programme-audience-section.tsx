import Image from "next/image";
import Link from "next/link";
import { Cpu, Globe, Users, type LucideIcon } from "lucide-react";

import { MARKETING_MEDIA } from "@/constants/marketing-media";
import type { Locale } from "@/constants/locales";
import { intakeCtaFor } from "@/lib/marketing/intake-cta";
import { cn } from "@/lib/utils";
import type {
  ProgrammeAudienceHighlightId,
  ProgrammePageCopy,
} from "@/types/marketing-page";

const HIGHLIGHT_ICONS: Record<ProgrammeAudienceHighlightId, LucideIcon> = {
  team: Users,
  product: Cpu,
  market: Globe,
};

type ProgrammeAudienceSectionProps = {
  locale: Locale;
  copy: ProgrammePageCopy["audience"];
  openApplications: boolean;
};

/**
 * Programme “Who it is for” — diagonal split with mentor photo and intake CTA.
 * Darker teal panel + light type opposite the photo.
 */
export function ProgrammeAudienceSection({
  locale,
  copy,
  openApplications,
}: ProgrammeAudienceSectionProps) {
  const intake = intakeCtaFor(locale, openApplications);
  const media = MARKETING_MEDIA.programme;

  return (
    <section
      id="audience"
      aria-labelledby="programme-audience-heading"
      className="relative scroll-mt-24 overflow-hidden border-b border-[#0d5555] bg-[#0d5555] text-primary-foreground"
    >
      <div
        className={cn(
          "relative h-64 w-full bg-[#0d5555] sm:h-80",
          "md:absolute md:inset-0 md:h-auto",
          "md:[clip-path:polygon(56%_0,100%_0,100%_100%,72%_100%)]",
        )}
      >
        <Image
          src={media.src}
          alt={media.alt[locale]}
          fill
          className="object-cover"
          style={{ objectPosition: media.position }}
          sizes="(max-width: 768px) 100vw, 48vw"
        />
        <div
          className="absolute inset-0 bg-[#0d5555]/35 md:bg-[#0d5555]/20"
          aria-hidden
        />
      </div>

      <div className="relative z-10 flex w-full flex-col justify-between py-10 pl-10 pr-5 sm:py-12 sm:pl-16 sm:pr-8 md:min-h-[28rem] md:w-[56%] md:py-14 md:pl-20 lg:min-h-[32rem] lg:py-16 lg:pl-24 lg:pr-12 xl:pl-[max(6rem,calc((100vw-80rem)/2+2.5rem))]">
        <div>
          <div className="flex items-center gap-3">
            <span
              className="grid size-10 shrink-0 grid-cols-2 overflow-hidden rounded-full ring-2 ring-primary-foreground/30"
              aria-hidden
            >
              <span className="bg-primary-foreground/90" />
              <span className="bg-[#81b764]" />
              <span className="bg-[#c14a9b]" />
              <span className="bg-[#dc395f]" />
            </span>
            <div className="min-w-0">
              <p className="font-heading text-sm font-semibold tracking-wide text-primary-foreground">
                ASIP
              </p>
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-primary-foreground/75">
                {copy.eyebrow}
              </p>
            </div>
          </div>

          <h2
            id="programme-audience-heading"
            className="mt-8 font-heading text-3xl font-semibold leading-[1.08] text-primary-foreground sm:text-4xl lg:text-5xl"
          >
            {copy.title}
          </h2>
          <span
            className="mt-5 block h-px w-16 bg-primary-foreground/50"
            aria-hidden
          />
          <p className="mt-5 text-base leading-7 text-primary-foreground/85 sm:text-lg sm:leading-8">
            {copy.description}
          </p>
          <Link
            href={intake.href}
            className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground underline-offset-4 hover:underline"
          >
            {intake.label}
          </Link>
        </div>

        <ul className="mt-12 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
          {copy.highlights.map((item) => {
            const Icon = HIGHLIGHT_ICONS[item.id];
            return (
              <li key={item.id} className="flex items-center gap-2.5">
                <Icon
                  className="size-4 shrink-0 text-primary-foreground/90"
                  aria-hidden
                />
                <span className="text-sm text-primary-foreground/80">
                  {item.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
