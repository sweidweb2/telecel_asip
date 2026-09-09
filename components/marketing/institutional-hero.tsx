import type { ReactNode } from "react";

import {
  InstitutionalHeroField,
  type InstitutionalComposition,
} from "@/components/marketing/institutional-hero-field";
import { cn } from "@/lib/utils";

type InstitutionalHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  headingId?: string;
  /** Unique field pattern ids when multiple heroes could coexist. */
  patternId?: string;
  composition?: InstitutionalComposition;
  /** Tighter vertical rhythm for legal / utility pages. */
  size?: "default" | "compact";
  className?: string;
};

/**
 * Shared marketing hero — ASIP ink night panel with geometric atmosphere.
 * Copy layout stays consistent; only `composition` changes the background.
 */
export function InstitutionalHero({
  eyebrow,
  title,
  description,
  action,
  headingId = "institutional-hero-heading",
  patternId,
  composition = "aurora",
  size = "default",
  className,
}: InstitutionalHeroProps) {
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "institutional-hero relative isolate overflow-hidden bg-[#14333b] text-white",
        className,
      )}
    >
      <InstitutionalHeroField
        patternId={patternId}
        composition={composition}
      />

      <div
        className={cn(
          "relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
          size === "compact"
            ? "py-12 sm:py-14 lg:py-16"
            : "py-14 sm:py-16 lg:py-20",
        )}
      >
        <div
          data-hero-copy
          className={cn(
            "flex w-full max-w-3xl flex-col justify-end",
            size === "default" && "min-h-[14rem] sm:min-h-[16rem]",
          )}
        >
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-asip-mint">
              {eyebrow}
            </p>
          ) : null}
          <h1
            id={headingId}
            className={cn(
              "font-heading text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl lg:text-5xl",
              eyebrow ? "mt-3" : null,
            )}
          >
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:mt-6 sm:text-lg sm:leading-8">
            {description}
          </p>
          {action ? <div className="mt-7 sm:mt-8">{action}</div> : null}
        </div>
      </div>
    </section>
  );
}
