import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { HOME_ORBIT_LOGOS } from "@/constants/home-orbit-logos";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type { IntakeCta } from "@/lib/marketing/intake-cta";
import { cn } from "@/lib/utils";
import type { HomePageCopy } from "@/types/marketing-page";

type HomeNextChapterSectionProps = {
  locale: Locale;
  copy: HomePageCopy["nextChapter"];
  intake: IntakeCta;
  className?: string;
};

/**
 * Home Module 08 — 2026 next chapter.
 *
 * UI logic: one centered CTA composition. Partner marks float in a loose
 * constellation around the copy (desktop) / quiet row above (mobile) —
 * ecosystem gathering toward the next chapter, not a logo wall.
 */
export function HomeNextChapterSection({
  locale,
  copy,
  intake,
  className,
}: HomeNextChapterSectionProps) {
  const secondaryHref = publicPath(locale, copy.secondaryCta.slug);

  return (
    <section
      className={cn(
        "home-module-seam-to relative overflow-hidden border-b border-border",
        "px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20",
        className,
      )}
    >
      {/* Soft ambient orbs — top-left mirrors Telecel’s bottom-left seam orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute top-10 left-[8%] size-40 rounded-full bg-brand/10 blur-3xl sm:size-56" />
        <div className="absolute right-[10%] bottom-8 size-48 rounded-full bg-[color-mix(in_oklab,var(--asip-magenta)_12%,transparent)] blur-3xl sm:size-64" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        {/* Mobile / tablet: compact logo signal strip above copy */}
        <ul className="mb-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:hidden">
          {HOME_ORBIT_LOGOS.slice(0, 4).map((logo) => (
            <li
              key={logo.id}
              className="flex h-11 min-w-11 items-center justify-center rounded-full border border-border/70 bg-background/80 px-3 shadow-sm backdrop-blur-sm"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                sizes="4.5rem"
                className="h-5 w-auto max-w-[4.5rem] object-contain opacity-80"
                style={{ width: "auto", height: "auto" }}
              />
            </li>
          ))}
        </ul>

        <div className="relative mx-auto max-w-2xl text-center lg:max-w-3xl">
          {/* Desktop orbit — logos sit outside the copy column */}
          <OrbitLogos className="pointer-events-none absolute inset-0 hidden lg:block" />

          <p className="text-xs font-semibold tracking-[0.2em] text-brand uppercase">
            2026
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl">
            {copy.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:mt-5 sm:text-lg sm:leading-8">
            {copy.description}
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-9 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href={intake.href}
              className={cn(
                buttonVariants({ size: "lg" }),
                "min-h-11 w-full rounded-full bg-asip-coral px-8 text-white hover:bg-asip-coral-hover sm:w-auto",
              )}
            >
              {intake.label}
            </Link>
            <Link
              href={secondaryHref}
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "min-h-11 w-full rounded-full border-foreground/20 bg-background/60 px-8 backdrop-blur-sm sm:w-auto",
              )}
            >
              {copy.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Absolute positions form a loose constellation — varied size / opacity / float phase. */
function OrbitLogos({ className }: { className?: string }) {
  const slots = [
    {
      logo: HOME_ORBIT_LOGOS[0],
      className:
        "left-[-18%] top-[8%] next-chapter-float",
      shell: "h-14 w-[7.5rem] opacity-90",
    },
    {
      logo: HOME_ORBIT_LOGOS[1],
      className:
        "left-[-22%] bottom-[18%] next-chapter-float-delayed",
      shell: "h-12 w-16 opacity-75",
    },
    {
      logo: HOME_ORBIT_LOGOS[2],
      className:
        "left-[-6%] top-[62%] next-chapter-float",
      shell: "h-12 w-[6.5rem] opacity-80",
    },
    {
      logo: HOME_ORBIT_LOGOS[3],
      className:
        "right-[-16%] top-[12%] next-chapter-float-delayed",
      shell: "h-12 w-24 opacity-85",
    },
    {
      logo: HOME_ORBIT_LOGOS[4],
      className:
        "right-[-20%] bottom-[22%] next-chapter-float",
      shell: "h-14 w-[6.75rem] opacity-80",
    },
    {
      logo: HOME_ORBIT_LOGOS[5],
      className:
        "right-[-4%] top-[58%] next-chapter-float-delayed",
      shell: "h-11 w-16 opacity-70",
    },
  ] as const;

  return (
    <ul className={className} aria-hidden>
      {slots.map(({ logo, className: pos, shell }) => (
        <li
          key={logo.id}
          className={cn("absolute", pos)}
        >
          <div
            className={cn(
              "flex items-center justify-center rounded-2xl border border-border/60 bg-background/85 px-3 shadow-[0_10px_30px_-18px_rgba(20,51,59,0.45)] backdrop-blur-md",
              shell,
            )}
          >
            <Image
              src={logo.src}
              alt=""
              width={logo.width}
              height={logo.height}
              sizes="7.5rem"
              className="h-auto max-h-7 w-auto max-w-[85%] object-contain"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
