import Link from "next/link";

import {
  PageHero,
  Section,
  SectionHeading,
} from "@/components/marketing/page-elements";
import { PageCtaSection } from "@/components/marketing/page-cta-section";
import { LogoCloudGrid } from "@/components/ui/logo-cloud";
import { buttonVariants } from "@/components/ui/button";
import { PARTNER_LOGOS } from "@/constants/partner-logos";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type { PartnersPageCopy } from "@/types/marketing-page";
import { cn } from "@/lib/utils";

type PartnersPageContentProps = {
  locale: Locale;
  copy: PartnersPageCopy;
};

export function PartnersPageContent({
  locale,
  copy,
}: PartnersPageContentProps) {
  const { columns, rows } = copy.types;

  return (
    <main>
      <PageHero
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        description={copy.hero.description}
      >
        <Link
          href={publicPath(locale, copy.hero.cta.slug)}
          className={cn(
            buttonVariants({ size: "lg" }),
            "min-h-11 w-full sm:w-auto",
          )}
        >
          {copy.hero.cta.label}
        </Link>
      </PageHero>

      <Section className="border-t">
        <SectionHeading
          title={copy.proposition.title}
          description={copy.proposition.description}
          className="max-w-3xl"
        />

        <ul className="grid grid-cols-1 gap-4 md:hidden">
          {rows.map((row) => (
            <li key={row.id} className="rounded-xl border bg-card p-5 sm:p-6">
              <h3 className="font-heading text-lg font-semibold tracking-tight">
                {row.type}
              </h3>
              <dl className="mt-4 space-y-3 text-sm leading-6 sm:text-base sm:leading-7">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {columns.value}
                  </dt>
                  <dd className="mt-1 text-muted-foreground">{row.value}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {columns.examples}
                  </dt>
                  <dd className="mt-1 text-muted-foreground">{row.examples}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <caption className="sr-only">{copy.proposition.title}</caption>
            <thead>
              <tr className="border-b">
                <th
                  scope="col"
                  className="pb-3 pr-4 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {columns.type}
                </th>
                <th
                  scope="col"
                  className="px-4 pb-3 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {columns.value}
                </th>
                <th
                  scope="col"
                  className="pb-3 pl-4 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {columns.examples}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-b-0">
                  <th
                    scope="row"
                    className="py-4 pr-4 align-top font-heading text-base font-semibold tracking-tight"
                  >
                    {row.type}
                  </th>
                  <td className="px-4 py-4 align-top leading-6 text-muted-foreground">
                    {row.value}
                  </td>
                  <td className="py-4 pl-4 align-top leading-6 text-muted-foreground">
                    {row.examples}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="partners" className="scroll-mt-20 border-t">
        <SectionHeading
          title={copy.logos.title}
          className="mx-auto mb-10 max-w-2xl text-center sm:mb-12"
        />
        <LogoCloudGrid logos={PARTNER_LOGOS} />
      </Section>

      <PageCtaSection locale={locale} cta={copy.ctaSection} />
    </main>
  );
}
