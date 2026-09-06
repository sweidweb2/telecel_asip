import Image from "next/image";
import { ArrowUp, PanelLeft, Plus } from "lucide-react";

import { TELECEL_GROUP_URL } from "@/components/layout/site-footer-labels";
import { HOME_ORBIT_LOGOS } from "@/constants/home-orbit-logos";
import { cn } from "@/lib/utils";
import type { HomePageCopy } from "@/types/marketing-page";

type HomeTelecelConnectionSectionProps = {
  copy: HomePageCopy["telecel"];
  className?: string;
};

type FloatSlot = {
  logo: (typeof HOME_ORBIT_LOGOS)[number];
  className: string;
  shell: string;
  blur: string;
  floatClassName: string;
};

const FLOAT_SLOTS: FloatSlot[] = [
  {
    logo: HOME_ORBIT_LOGOS[0],
    className: "left-[2%] top-[12%] sm:left-[4%] sm:top-[10%] lg:left-[6%]",
    shell: "h-14 w-[7rem] sm:h-16 sm:w-[8.5rem]",
    blur: "blur-[2px] opacity-70",
    floatClassName: "about-story-float",
  },
  {
    logo: HOME_ORBIT_LOGOS[1],
    className: "right-[3%] top-[8%] sm:right-[6%] sm:top-[6%] lg:right-[8%]",
    shell: "h-12 w-14 sm:h-14 sm:w-16",
    blur: "blur-[3px] opacity-55",
    floatClassName: "next-chapter-float-delayed",
  },
  {
    logo: HOME_ORBIT_LOGOS[2],
    className:
      "bottom-[18%] left-[1%] hidden sm:flex sm:bottom-[22%] sm:left-[3%] lg:left-[5%]",
    shell: "h-14 w-[7.5rem]",
    blur: "blur-[4px] opacity-45",
    floatClassName: "next-chapter-float",
  },
  {
    logo: HOME_ORBIT_LOGOS[3],
    className:
      "right-[2%] bottom-[28%] hidden sm:flex sm:right-[4%] lg:right-[7%]",
    shell: "h-12 w-[6.5rem] sm:h-14 sm:w-[7.5rem]",
    blur: "blur-[2.5px] opacity-60",
    floatClassName: "about-story-float-delayed",
  },
  {
    logo: HOME_ORBIT_LOGOS[4],
    className:
      "left-[8%] top-[42%] hidden lg:flex lg:left-[2%] xl:left-[4%]",
    shell: "h-16 w-[8rem]",
    blur: "blur-[5px] opacity-35",
    floatClassName: "honeycomb-float",
  },
  {
    logo: HOME_ORBIT_LOGOS[5],
    className:
      "right-[6%] top-[40%] hidden lg:flex lg:right-[3%] xl:right-[5%]",
    shell: "h-12 w-16",
    blur: "blur-[6px] opacity-30",
    floatClassName: "honeycomb-float-delayed",
  },
];

/**
 * Home Module 07 — Telecel Connection.
 * Chat-style lockup for “Powered by Connecting Energies”; Telecel as
 * connector/backer, not the hero. Partner marks float blurred around the card.
 */
export function HomeTelecelConnectionSection({
  copy,
  className,
}: HomeTelecelConnectionSectionProps) {
  return (
    <section
      id="telecel"
      aria-labelledby="home-telecel-heading"
      className={cn(
        "home-module-seam-from relative overflow-hidden border-t border-border",
        "px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20",
        className,
      )}
    >
      {/* Seam orbs — mirrored with Next Chapter’s top-left orb */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-10 left-[8%] size-40 rounded-full bg-brand/10 blur-3xl sm:size-56" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl">
        {/* Depth-of-field partner marks */}
        <ul className="pointer-events-none absolute inset-0" aria-hidden>
          {FLOAT_SLOTS.map((slot) => (
            <li
              key={slot.logo.id}
              className={cn(
                "absolute flex items-center justify-center",
                slot.className,
                slot.floatClassName,
                slot.blur,
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-2xl border border-border/60 bg-background/80 px-3 shadow-[0_18px_40px_-20px_rgba(20,51,59,0.35)] backdrop-blur-sm",
                  slot.shell,
                )}
              >
                <Image
                  src={slot.logo.src}
                  alt=""
                  width={slot.logo.width}
                  height={slot.logo.height}
                  className="h-auto max-h-8 w-auto max-w-[5.5rem] object-contain opacity-80 sm:max-h-9"
                />
              </div>
            </li>
          ))}
        </ul>

        {/* Chat window */}
        <div className="relative z-10 mx-auto w-full max-w-xl sm:max-w-2xl">
          <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-background shadow-[0_28px_80px_-36px_rgba(20,51,59,0.45)] sm:rounded-[2rem]">
            {/* Title bar */}
            <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-1.5" aria-hidden>
                <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                <span className="size-2.5 rounded-full bg-[#febc2e]" />
                <span className="size-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="ml-1 flex items-center gap-2 text-muted-foreground">
                <PanelLeft className="size-4 opacity-50" aria-hidden />
                <Plus className="size-4 opacity-50" aria-hidden />
              </div>
              <p className="ml-auto truncate text-xs font-medium tracking-wide text-muted-foreground">
                Telecel · ASIP
              </p>
            </div>

            <div className="flex flex-col gap-6 px-4 py-6 sm:gap-7 sm:px-7 sm:py-8">
              {/* User prompt */}
              <p className="mx-auto w-fit max-w-full rounded-full bg-muted px-4 py-2.5 text-center text-sm font-medium text-foreground sm:px-5 sm:text-base">
                {copy.prompt}
              </p>

              {/* Answer */}
              <div className="min-w-0 space-y-3 sm:space-y-4">
                <h2
                  id="home-telecel-heading"
                  className="font-heading text-xl font-semibold tracking-tight text-balance text-foreground sm:text-2xl"
                >
                  {copy.title}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                  {copy.description}
                </p>
              </div>

              {/* Input + send (CTA) */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex min-h-11 min-w-0 flex-1 items-center rounded-full bg-muted px-4 text-sm text-muted-foreground sm:min-h-12 sm:px-5">
                  <span className="truncate">{copy.inputPlaceholder}</span>
                </div>
                <a
                  href={TELECEL_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={copy.ctaLabel}
                  className={cn(
                    "inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[#dc395f] text-white shadow-sm transition-opacity hover:opacity-90 sm:size-12",
                    "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  )}
                >
                  <ArrowUp className="size-5" strokeWidth={2.25} aria-hidden />
                </a>
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-muted-foreground sm:mt-6 sm:text-sm">
            {copy.ctaLabel}
            <span className="mx-1.5 text-border" aria-hidden>
              ·
            </span>
            <a
              href={TELECEL_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              telecelgroup.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
