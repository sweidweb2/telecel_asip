import Link from "next/link";
import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { renderEmphasis, stripEmphasis } from "@/components/marketing/brand-accents";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      data-reveal="section"
      className={cn("mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20", className)}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-10 max-w-3xl", className)}>
      {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase text-primary">{eyebrow}</p> : null}
      <h2
        aria-label={stripEmphasis(title)}
        className="font-heading text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-balance sm:text-5xl"
      >
        {renderEmphasis(title)}
      </h2>
      {description ? <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p> : null}
    </div>
  );
}

/** Brand-tracking eyebrow used across home (and matching) marketing modules. */
/** Mint pill label above home section headings (refresh phase 3). */
export const sectionEyebrowClassName =
  "flex w-fit items-center gap-1.5 rounded-full bg-asip-mint px-3 py-1 font-heading text-xs font-semibold tracking-tight text-asip-ink sm:text-sm";

export function SectionEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn(sectionEyebrowClassName, className)}>{children}</p>;
}

/**
 * Shared coral primary CTA surface; size and min-height stay overridable.
 * Tactile press: ink border + hard offset shadow that lifts on hover and
 * collapses on press. Shadow colour comes from --cta-shadow (see tones).
 */
export const coralCtaClassName =
  "w-full rounded-full border-2 border-asip-ink bg-asip-coral text-white shadow-[3px_3px_0_0_var(--cta-shadow)] [--cta-shadow:var(--asip-ink)] transition-[translate,box-shadow,background-color] duration-200 ease-spring hover:-translate-x-px hover:-translate-y-px hover:bg-asip-coral-hover hover:shadow-[4px_4px_0_0_var(--cta-shadow)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none motion-reduce:transition-none sm:w-auto";

/** On dark panels the ink shadow disappears, so it switches to mint. */
export const coralCtaOnDarkClassName = "[--cta-shadow:var(--asip-mint)]";

export function CoralCtaLink({
  href,
  children,
  className,
  size = "lg",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  size?: ButtonSize;
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ size }),
        coralCtaClassName,
        "min-h-11 px-8",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function OutlineCtaLink({
  href,
  children,
  className,
  size = "lg",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  size?: ButtonSize;
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ size, variant: "outline" }),
        "min-h-11 w-full rounded-full border-foreground/20 px-8 transition-[translate,background-color,color] duration-200 ease-spring hover:-translate-y-px motion-reduce:transition-none sm:w-auto",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** Primary + secondary CTA row used by outcomes / next-chapter style modules. */
export function MarketingCtaRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
