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
 * Shared closing CTA — illustration + headline + support + pill button.
 * Used on Apply, FAQ, Founders, Impact, Partners, Programme, Alumni, About.
 */
export function PageCtaSection({ locale, cta, className }: PageCtaSectionProps) {
  const href = `${publicPath(locale, cta.slug)}${cta.hash ? `#${cta.hash}` : ""}`;

  return (
    <section
      className={cn(
        "border-t border-border bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <CtaStartupIllustration className="mb-8 h-auto w-full max-w-sm sm:mb-10 sm:max-w-md" />

        <h2 className="max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl">
          {cta.title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8">
          {cta.description}
        </p>
        <Link
          href={href}
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-8 min-h-11 rounded-full px-8 sm:mt-10",
          )}
        >
          {cta.label}
        </Link>
      </div>
    </section>
  );
}
