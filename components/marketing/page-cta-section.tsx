import Link from "next/link";

import { Section } from "@/components/marketing/page-elements";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type { MarketingPageCopy } from "@/types/marketing-page";
import { cn } from "@/lib/utils";

type PageCtaSectionProps = {
  locale: Locale;
  cta: NonNullable<MarketingPageCopy["ctaSection"]>;
};

/** Closing call-to-action panel shared by founders, impact, partners and alumni. */
export function PageCtaSection({ locale, cta }: PageCtaSectionProps) {
  const href = `${publicPath(locale, cta.slug)}${cta.hash ? `#${cta.hash}` : ""}`;

  return (
    <Section className="border-t py-8 sm:py-10 lg:py-12">
      <div className="grid items-center gap-7 border-l-4 border-[#dc395f] bg-[#14333b] px-6 py-8 text-white sm:px-8 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-8">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {cta.title}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
            {cta.description}
          </p>
        </div>
        <div className="lg:col-span-4 lg:text-right">
          <Link
            href={href}
            className={cn(
              buttonVariants(),
              "inline-flex min-h-11 w-full sm:w-auto",
            )}
          >
            {cta.label}
          </Link>
        </div>
      </div>
    </Section>
  );
}
