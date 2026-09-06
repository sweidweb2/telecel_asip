import Image from "next/image";
import type { CSSProperties } from "react";

import {
  LAB_PARTNER_HONEYCOMB_LOGOS,
  labPartnersHoneycombCopyFor,
  type LabPartnerLogo,
} from "@/constants/lab-partners-honeycomb";
import type { Locale } from "@/constants/locales";
import { cn } from "@/lib/utils";

type LabPartnersHoneycombSectionProps = {
  locale: Locale;
  className?: string;
};

/** Pointy-top hex — soft enough that logos still read clearly. */
const HEX_CLIP =
  "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";

/** Same four marks as the navbar top stripe. */
const BRAND_RING =
  "conic-gradient(from -20deg, #179191 0deg 90deg, #81b764 90deg 180deg, #c14a9b 180deg 270deg, #dc395f 270deg 360deg)";

/**
 * Wide horizontal honeycomb — three short rows around a centred ASIP mark.
 * Layout sketch (C = centre):
 *      P  P              P  P
 *   P  P  P      C       P  P  P
 *      P  P              P  P
 */
const DESKTOP_SLOTS: ReadonlyArray<{
  left: string;
  top: string;
  size: "sm" | "md";
  delay: string;
}> = [
  // Top row
  { left: "18%", top: "16%", size: "md", delay: "0s" },
  { left: "30%", top: "16%", size: "sm", delay: "0.35s" },
  { left: "70%", top: "16%", size: "sm", delay: "0.2s" },
  { left: "82%", top: "16%", size: "md", delay: "0.55s" },
  // Middle row — 3 left + 3 right (one left slot is a copied right mark)
  { left: "10%", top: "50%", size: "md", delay: "0.7s" },
  { left: "22%", top: "50%", size: "sm", delay: "0.15s" },
  { left: "34%", top: "50%", size: "sm", delay: "0.05s" },
  { left: "66%", top: "50%", size: "sm", delay: "0.45s" },
  { left: "78%", top: "50%", size: "md", delay: "0.9s" },
  { left: "90%", top: "50%", size: "sm", delay: "0.25s" },
  // Bottom row
  { left: "18%", top: "84%", size: "sm", delay: "0.6s" },
  { left: "30%", top: "84%", size: "md", delay: "0.3s" },
  { left: "70%", top: "84%", size: "md", delay: "0.8s" },
  { left: "82%", top: "84%", size: "sm", delay: "1.05s" },
];

/** Desktop needs 14 tiles; copy one right-flank logo into the extra left mid slot. */
function desktopHoneycombLogos(
  logos: readonly LabPartnerLogo[],
): LabPartnerLogo[] {
  const source = logos[8] ?? logos[0];
  if (!source) return [];

  const list = [...logos];
  list.splice(6, 0, { ...source, id: `${source.id}-copy` });
  return list;
}

/**
 * Lab playground — partners honeycomb inspired by a tech-partner cluster:
 * wide horizontal stage, white hexes, centre ASIP mark with brand-colour ring.
 */
export function LabPartnersHoneycombSection({
  locale,
  className,
}: LabPartnersHoneycombSectionProps) {
  const copy = labPartnersHoneycombCopyFor(locale);
  const logos = LAB_PARTNER_HONEYCOMB_LOGOS;
  const desktopLogos = desktopHoneycombLogos(logos);

  return (
    <section
      aria-labelledby="lab-partners-honeycomb-heading"
      className={cn(
        "relative overflow-hidden border-t border-border",
        "bg-[radial-gradient(90%_70%_at_12%_8%,color-mix(in_oklab,var(--brand)_16%,transparent),transparent_52%),radial-gradient(80%_60%_at_92%_92%,color-mix(in_oklab,var(--asip-magenta)_12%,transparent),transparent_50%),linear-gradient(180deg,var(--brand-subtle),var(--background)_65%)]",
        "px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20",
        className,
      )}
    >
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-brand uppercase">
            {copy.eyebrow}
          </p>
          <h2
            id="lab-partners-honeycomb-heading"
            className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl"
          >
            {copy.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:mt-5 sm:text-lg sm:leading-8">
            {copy.description}
          </p>
        </div>

        {/* Mobile / tablet: centre mark, then wrapping row */}
        <ul className="mx-auto mt-10 flex max-w-lg flex-wrap items-center justify-center gap-3 sm:mt-12 sm:gap-4 lg:hidden">
          <li className="order-first w-full basis-full">
            <div className="mx-auto w-[7.5rem] sm:w-36">
              <CentreHex className="honeycomb-float" />
            </div>
          </li>
          {logos.map((logo, index) => (
            <li key={logo.id} className="shrink-0">
              <PartnerHex
                logo={logo}
                size="sm"
                className={cn(
                  index % 2 === 0
                    ? "honeycomb-float"
                    : "honeycomb-float-delayed",
                )}
                style={{ animationDelay: `${(index % 5) * 0.35}s` }}
              />
            </li>
          ))}
        </ul>

        {/* Desktop: wide, short honeycomb centred on the ASIP card */}
        <div className="relative mx-auto mt-12 hidden h-[17rem] w-full max-w-5xl lg:block xl:mt-14 xl:h-[19rem]">
          <ul className="absolute inset-0 list-none">
            {desktopLogos.map((logo, index) => {
              const slot = DESKTOP_SLOTS[index];
              if (!slot) return null;

              return (
                <li
                  key={logo.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: slot.left,
                    top: slot.top,
                  }}
                >
                  <PartnerHex
                    logo={logo}
                    size={slot.size}
                    className={
                      index % 2 === 0
                        ? "honeycomb-float"
                        : "honeycomb-float-delayed"
                    }
                    style={{ animationDelay: slot.delay }}
                  />
                </li>
              );
            })}
          </ul>

          <div className="absolute top-1/2 left-1/2 z-10 w-[9.5rem] -translate-x-1/2 -translate-y-1/2 xl:w-[11rem]">
            <CentreHex className="honeycomb-float-centre" />
          </div>
        </div>
      </div>
    </section>
  );
}

function CentreHex({ className }: { className?: string }) {
  return (
    <div
      className={cn("relative aspect-[0.9] w-full", className)}
      style={{ filter: "drop-shadow(0 12px 20px rgb(20 51 59 / 0.14))" }}
    >
      {/* Brand-colour ring (navbar stripe mix) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ clipPath: HEX_CLIP, background: BRAND_RING }}
      />
      {/* White fill — same treatment as partner hexes */}
      <div
        className="absolute inset-[3.5px] flex items-center justify-center bg-background xl:inset-1"
        style={{ clipPath: HEX_CLIP }}
      >
        <Image
          src="/icon.png"
          alt="Africa Startup Initiative"
          width={140}
          height={140}
          className="h-[58%] w-[58%] object-contain"
          sizes="11rem"
          priority={false}
        />
      </div>
    </div>
  );
}

function PartnerHex({
  logo,
  size,
  className,
  style,
}: {
  logo: LabPartnerLogo;
  size: "sm" | "md";
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[0.9]",
        size === "sm"
          ? "w-[4.75rem] xl:w-[5.25rem]"
          : "w-[5.5rem] xl:w-[6.25rem]",
        className,
      )}
      style={{
        filter: "drop-shadow(0 10px 16px rgb(20 51 59 / 0.1))",
        ...style,
      }}
    >
      <div
        className="flex size-full items-center justify-center bg-background"
        style={{ clipPath: HEX_CLIP }}
      >
        <Image
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          className="h-auto max-h-[42%] w-auto max-w-[68%] object-contain"
          sizes="6.25rem"
        />
      </div>
    </div>
  );
}
