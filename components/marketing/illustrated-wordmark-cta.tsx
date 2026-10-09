import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CtaLink = {
  href: string;
  label: string;
};

type IllustratedWordmarkCtaProps = {
  title: string;
  description: string;
  primary: CtaLink;
  secondary?: CtaLink;
  className?: string;
};

/**
 * Closing CTA in the poster-wordmark pattern: heavy display type filled
 * with the ASIP camouflage, corner figures, and pill actions.
 */
export function IllustratedWordmarkCta({
  title,
  description,
  primary,
  secondary,
  className,
}: IllustratedWordmarkCtaProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24",
        className,
      )}
    >
      <div className="relative mx-auto w-full max-w-5xl text-center">
        <div className="relative">
          <CornerFigures />
          <SparkField />
          <h2 className="illustrated-wordmark relative px-9 font-heading text-[clamp(2.35rem,6.2vw,6rem)] font-extrabold leading-[0.96] tracking-[-0.03em] text-balance sm:px-16 lg:px-24">
            {title}
          </h2>
        </div>

        <p className="mx-auto mt-8 max-w-xl text-base leading-7 text-muted-foreground sm:mt-9 sm:text-lg sm:leading-8">
          {description}
        </p>

        <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href={primary.href}
            className={cn(
              buttonVariants({ size: "lg" }),
              "min-h-11 w-full rounded-full border border-transparent bg-[color-mix(in_srgb,var(--asip-coral)_32%,white)] px-8 text-asip-ink hover:bg-[color-mix(in_srgb,var(--asip-coral)_46%,white)] sm:w-auto",
            )}
          >
            {primary.label}
          </Link>
          {secondary ? (
            <Link
              href={secondary.href}
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "min-h-11 w-full rounded-full border-[color-mix(in_srgb,var(--brand)_42%,white)] bg-[color-mix(in_srgb,var(--brand)_10%,white)] px-8 text-asip-ink hover:bg-[color-mix(in_srgb,var(--brand)_18%,white)] sm:w-auto",
              )}
            >
              {secondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function CornerFigures() {
  return (
    <div aria-hidden className="pointer-events-none">
      <div className="illustrated-cta-float absolute top-0 left-0 z-10 w-11 sm:w-24 lg:w-32">
        <BuilderMark />
      </div>
      <div className="illustrated-cta-float-delayed absolute top-0 right-0 z-10 w-11 sm:top-[22%] sm:w-24 lg:w-[8.5rem]">
        <SignalMark />
      </div>
    </div>
  );
}

function SparkField() {
  const sparks = [
    { className: "top-[4%] left-[18%] text-[#f3b7c8]", size: 14 },
    { className: "top-[-2%] left-[46%] hidden text-[#b7e0d8] sm:block", size: 10 },
    { className: "top-[10%] right-[16%] text-[#e7c0de]", size: 16 },
    { className: "top-[42%] right-[5%] text-[#9fd4cc]", size: 11 },
    { className: "bottom-[14%] left-[7%] text-[#c5e3bc]", size: 12 },
    { className: "right-[30%] bottom-[-1%] hidden text-[#f3b7c8] sm:block", size: 9 },
  ] as const;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {sparks.map((spark) => (
        <Spark key={spark.className} className={spark.className} size={spark.size} />
      ))}
    </div>
  );
}

function Spark({ className, size }: { className: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn("absolute", className)}
    >
      <path
        fill="currentColor"
        d="M12 0 13.7 8.4 22 12l-8.3 1.8L12 24l-1.7-10.2L2 12l8.3-1.6L12 0z"
      />
    </svg>
  );
}

/** Flat founder mark — coral body, teal signal, soft halo. */
function BuilderMark() {
  return (
    <svg viewBox="0 0 160 160" className="h-auto w-full">
      <circle cx="80" cy="78" r="58" fill="#f6c9d6" fillOpacity="0.7" />
      <circle cx="80" cy="78" r="42" fill="#efc6e4" fillOpacity="0.55" />
      <ellipse cx="80" cy="108" rx="34" ry="26" fill="#f3b7c8" />
      <circle cx="80" cy="72" r="24" fill="#fbfaf6" />
      <circle cx="71" cy="70" r="2.4" fill="#14333b" />
      <circle cx="89" cy="70" r="2.4" fill="#14333b" />
      <path
        d="M72 78c3 4 13 4 16 0"
        fill="none"
        stroke="#14333b"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M80 48c0-8 6-12 6-18"
        fill="none"
        stroke="#8ecfc6"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <ellipse cx="90" cy="28" rx="8" ry="4.5" fill="#b7ddb0" transform="rotate(-28 90 28)" />
      <ellipse cx="78" cy="26" rx="6" ry="3.4" fill="#d4ecc8" transform="rotate(24 78 26)" />
    </svg>
  );
}

/** Flat signal mark — teal body, coral ring, mint arc. */
function SignalMark() {
  return (
    <svg viewBox="0 0 170 160" className="h-auto w-full">
      <circle cx="92" cy="78" r="58" fill="#b7e4dc" fillOpacity="0.85" />
      <circle cx="92" cy="78" r="42" fill="#d7f3ee" fillOpacity="0.9" />
      <ellipse cx="96" cy="108" rx="32" ry="24" fill="#9fd4cc" />
      <circle cx="96" cy="74" r="22" fill="#fbfaf6" />
      <circle cx="88" cy="72" r="2.3" fill="#14333b" />
      <circle cx="104" cy="72" r="2.3" fill="#14333b" />
      <path
        d="M89 80c2.4 3.2 11 3.2 14 0"
        fill="none"
        stroke="#14333b"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="48" cy="46" r="16" fill="none" stroke="#f3b7c8" strokeWidth="4" />
      <circle cx="48" cy="46" r="6" fill="#f3b7c8" />
      <path
        d="M128 36c10 6 14 18 10 28"
        fill="none"
        stroke="#14333b"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M136 30c14 8 18 24 12 36"
        fill="none"
        stroke="#c5ebe4"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
