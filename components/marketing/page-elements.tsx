import Link from "next/link";
import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

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
      <h2 className="font-heading text-3xl font-semibold leading-tight text-balance sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p> : null}
    </div>
  );
}

/** Brand-tracking eyebrow used across home (and matching) marketing modules. */
export const sectionEyebrowClassName =
  "text-xs font-semibold tracking-[0.2em] text-brand uppercase";

export function SectionEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn(sectionEyebrowClassName, className)}>{children}</p>;
}

/** Shared coral primary CTA surface; size and min-height stay overridable. */
export const coralCtaClassName =
  "w-full rounded-full bg-asip-coral text-white hover:bg-asip-coral-hover sm:w-auto";

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
        "min-h-11 w-full rounded-full border-foreground/20 px-8 sm:w-auto",
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
