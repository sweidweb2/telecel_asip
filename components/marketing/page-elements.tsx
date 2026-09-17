import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

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
