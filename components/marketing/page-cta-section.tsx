import Link from "next/link";

import { CtaStartupIllustration } from "@/components/marketing/cta-startup-illustration";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import type { PublicPageSlug } from "@/constants/public-pages";
import { publicPath } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type PageCtaCopy = {
  title: string;
  description: string;
  slug: PublicPageSlug;
  label: string;
  hash?: string;
};

type PageCtaSectionProps = {
  locale: Locale;
  cta: PageCtaCopy;
  className?: string;
};

/**
 * Shared closing CTA — full-width waves + centered headline / support / pill.
 */
export function PageCtaSection({ locale, cta, className }: PageCtaSectionProps) {
  const href = `${publicPath(locale, cta.slug)}${cta.hash ? `#${cta.hash}` : ""}`;

  return (
    <section
      className={cn(
        "border-t border-border bg-background py-8 sm:py-10 lg:py-12",
        className,
      )}
    >
      <CtaStartupIllustration className="mb-4 h-auto w-full sm:mb-5" />

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <h2 className="max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl">
          {cta.title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-muted-foreground sm:mt-3.5 sm:text-lg sm:leading-8">
          {cta.description}
        </p>
        <Link
          href={href}
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-4 min-h-11 rounded-full px-8 sm:mt-5",
          )}
        >
          {cta.label}
        </Link>
      </div>
    </section>
  );
}
