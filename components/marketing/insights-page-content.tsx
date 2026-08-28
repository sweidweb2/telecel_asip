import type { BlogLabels } from "@/components/marketing/blog-labels";
import { BlogSection } from "@/components/marketing/blog-section";
import { PageCtaSection } from "@/components/marketing/page-cta-section";
import { PageHero, Section } from "@/components/marketing/page-elements";
import type { Locale } from "@/constants/locales";
import type { ArticleListItem } from "@/types/article";
import type { InsightsPageCopy } from "@/types/marketing-page";

type InsightsPageContentProps = {
  locale: Locale;
  copy: InsightsPageCopy;
  labels: BlogLabels;
  articles: ArticleListItem[];
  featured?: ArticleListItem;
};

export function InsightsPageContent({
  locale,
  copy,
  labels,
  articles,
  featured,
}: InsightsPageContentProps) {
  const { columns, rows } = copy.streams;

  return (
    <main>
      <PageHero
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        description={copy.hero.description}
      />

      <Section className="border-t">
        <h2 className="sr-only">{columns.stream}</h2>
        <ul className="grid grid-cols-1 gap-4 md:hidden">
          {rows.map((row) => (
            <li key={row.id} className="rounded-xl border bg-card p-5 sm:p-6">
              <h3 className="font-heading text-lg font-semibold tracking-tight">
                {row.stream}
              </h3>
              <dl className="mt-4 space-y-3 text-sm leading-6 sm:text-base sm:leading-7">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {columns.purpose}
                  </dt>
                  <dd className="mt-1 text-muted-foreground">{row.purpose}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {columns.example}
                  </dt>
                  <dd className="mt-1 italic text-foreground/90">{row.example}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <caption className="sr-only">{columns.stream}</caption>
            <thead>
              <tr className="border-b">
                <th
                  scope="col"
                  className="pb-3 pr-4 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {columns.stream}
                </th>
                <th
                  scope="col"
                  className="px-4 pb-3 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {columns.purpose}
                </th>
                <th
                  scope="col"
                  className="pb-3 pl-4 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {columns.example}
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
                    {row.stream}
                  </th>
                  <td className="px-4 py-4 align-top leading-6 text-muted-foreground">
                    {row.purpose}
                  </td>
                  <td className="py-4 pl-4 align-top leading-6 italic text-foreground/90">
                    {row.example}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section className="border-t">
        <BlogSection
          locale={locale}
          labels={labels}
          articles={articles}
          featured={featured}
        />
      </Section>

      <PageCtaSection locale={locale} cta={copy.updates} />
    </main>
  );
}
