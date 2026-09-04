import Image from "next/image";
import Link from "next/link";

import { PageCtaSection } from "@/components/marketing/page-cta-section";
import { PageHero, Section, SectionHeading } from "@/components/marketing/page-elements";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { MARKETING_MEDIA } from "@/constants/marketing-media";
import { publicPath } from "@/constants/routes";
import type { ImpactPageCopy } from "@/types/marketing-page";
import { cn } from "@/lib/utils";

export function ImpactPageContent({ locale, copy }: { locale: Locale; copy: ImpactPageCopy }) {
  return (
    <main>
      <PageHero variant="poster" marker="2019—26" media={MARKETING_MEDIA.impact} locale={locale} eyebrow={copy.hero.eyebrow} title={copy.hero.title} description={copy.hero.description}>
        <Link href={publicPath(locale, copy.hero.cta.slug)} className={cn(buttonVariants({ size: "lg" }), "min-h-12 w-full sm:w-auto")}>{copy.hero.cta.label}</Link>
      </PageHero>
      <Section>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5"><SectionHeading eyebrow={copy.progress.eyebrow} title={copy.progress.title} description={copy.progress.description} /></div>
          <div className="lg:col-span-7">
            <ul className="grid border-t sm:grid-cols-2">
              {copy.lenses.rows.map((row, index) => <li key={row.id} className={cn("border-b py-6 sm:px-6", index % 2 === 0 && "sm:border-r sm:pl-0")}><p className="metric-numeral text-xs font-semibold text-primary">{String(index + 1).padStart(2, "0")}</p><h3 className="mt-3 font-heading text-xl font-semibold">{row.lens}</h3><p className="mt-2 leading-7 text-muted-foreground">{row.framing}</p></li>)}
            </ul>
          </div>
        </div>
      </Section>
      <section className="relative min-h-[30rem] overflow-hidden bg-[#14333b] sm:min-h-[38rem]">
        <Image src="/asip-media/impact-award.webp" alt={MARKETING_MEDIA.impact.alt[locale]} fill className="object-cover" style={{ objectPosition: MARKETING_MEDIA.impact.position }} sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,51,59,.92),rgba(20,51,59,.18))]" />
        <div className="relative mx-auto flex min-h-[30rem] w-full max-w-7xl items-end px-5 py-14 text-white sm:min-h-[38rem] sm:px-8 lg:px-10"><blockquote className="max-w-2xl font-heading text-3xl font-semibold leading-tight text-balance sm:text-5xl">{locale === "fr" ? "L’impact prend forme lorsque les fondateurs transforment une connaissance locale en progrès durable." : "Impact takes shape when founders turn local insight into lasting progress."}</blockquote></div>
      </section>
      <PageCtaSection locale={locale} cta={copy.ctaSection} />
    </main>
  );
}
