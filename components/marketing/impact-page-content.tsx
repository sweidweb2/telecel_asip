import Link from "next/link";

import {
  PageHero,
  Section,
  SectionHeading,
} from "@/components/marketing/page-elements";
import { PageCtaSection } from "@/components/marketing/page-cta-section";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type { ImpactPageCopy } from "@/types/marketing-page";
import { cn } from "@/lib/utils";

type ImpactPageContentProps = {
  locale: Locale;
  copy: ImpactPageCopy;
};

export function ImpactPageContent({ locale, copy }: ImpactPageContentProps) {
  const { columns, rows } = copy.lenses;

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
          eyebrow={copy.progress.eyebrow}
          title={copy.progress.title}
          description={copy.progress.description}
          className="max-w-3xl"
        />

        <ul className="grid grid-cols-1 gap-4 md:hidden">
          {rows.map((row) => (
            <li key={row.id} className="rounded-xl border bg-card p-5 sm:p-6">
              <h3 className="font-heading text-lg font-semibold tracking-tight">
                {row.lens}
              </h3>
              <dl className="mt-4 space-y-3 text-sm leading-6 sm:text-base sm:leading-7">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {columns.framing}
                  </dt>
                  <dd className="mt-1 text-muted-foreground">{row.framing}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {columns.evidence}
                  </dt>
                  <dd className="mt-1 text-muted-foreground">{row.evidence}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <caption className="sr-only">{copy.progress.title}</caption>
            <thead>
              <tr className="border-b">
                <th
                  scope="col"
                  className="pb-3 pr-4 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {columns.lens}
                </th>
                <th
                  scope="col"
                  className="px-4 pb-3 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {columns.framing}
                </th>
                <th
                  scope="col"
                  className="pb-3 pl-4 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {columns.evidence}
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
                    {row.lens}
                  </th>
                  <td className="px-4 py-4 align-top leading-6 text-muted-foreground">
                    {row.framing}
                  </td>
                  <td className="py-4 pl-4 align-top leading-6 text-muted-foreground">
                    {row.evidence}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {copy.evidenceRule}
        </p>
      </Section>

      <Section className="border-t">
        <SectionHeading
          eyebrow={copy.caseStudy.eyebrow}
          title={copy.caseStudy.title}
        />
        <figure className="rounded-xl border bg-card p-5 sm:p-8">
          <figcaption className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {copy.caseStudy.templateLabel}
          </figcaption>
          <blockquote className="mt-4 max-w-3xl text-base leading-7 text-pretty sm:text-lg sm:leading-8">
            {copy.caseStudy.body}
          </blockquote>
          <p className="mt-6 max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy.caseStudy.note}
          </p>
        </figure>
      </Section>

      <PageCtaSection locale={locale} cta={copy.ctaSection} />
    </main>
  );
}
