import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";

import {
  Section,
  SectionHeading,
} from "@/components/marketing/page-elements";
import { partnerLabelsFor } from "@/components/marketing/partner-labels";
import { PartnersNetwork } from "@/components/marketing/partners-network";
import { buttonVariants } from "@/components/ui/button";
import { getPublicPartners } from "@/data/partners";
import type { Locale } from "@/constants/locales";
import { MARKETING_MEDIA } from "@/constants/marketing-media";
import { publicPath } from "@/constants/routes";
import type { PartnersPageCopy } from "@/types/marketing-page";
import { cn } from "@/lib/utils";

type PartnersPageContentProps = {
  locale: Locale;
  copy: PartnersPageCopy;
};

export async function PartnersPageContent({
  locale,
  copy,
}: PartnersPageContentProps) {
  const { columns, rows } = copy.types;
  const labels = partnerLabelsFor(locale);
  const { active, historical } = await getPublicPartners();
  const signalWords = locale === "fr"
    ? ["Capital", "Marchés", "Expertise", "Technologie", "Visibilité", "Confiance"]
    : ["Capital", "Markets", "Expertise", "Technology", "Visibility", "Trust"];
  const routeLabel = locale === "fr" ? "Les connexions en mouvement" : "Connections in motion";
  const pathway = locale === "fr"
    ? ["Un besoin concret", "Le bon fondateur", "Une voie d'engagement"]
    : ["A real need", "The right founder", "A route to engage"];

  return (
    <main>
      <section className="partners-hero relative isolate overflow-hidden bg-[#102f37] text-white">
        <div className="absolute inset-y-0 right-0 hidden w-[46%] lg:block">
          <Image
            src={MARKETING_MEDIA.partners.src}
            alt={MARKETING_MEDIA.partners.alt[locale]}
            fill
            priority
            loading="eager"
            className="partners-hero-image object-cover"
            style={{ objectPosition: MARKETING_MEDIA.partners.position }}
            sizes="46vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#102f37_0%,rgba(16,47,55,.74)_22%,rgba(16,47,55,.08)_70%)]" />
        </div>

        <div className="relative min-h-[46rem] lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-12 lg:px-10">
          <figure className="relative aspect-[5/4] border-b-8 border-[#c14a9b] lg:hidden">
            <Image
              src={MARKETING_MEDIA.partners.src}
              alt={MARKETING_MEDIA.partners.alt[locale]}
              fill
              priority
              loading="eager"
              className="partners-hero-image object-cover"
              style={{ objectPosition: MARKETING_MEDIA.partners.position }}
              sizes="100vw"
            />
          </figure>

          <div data-hero-copy className="relative z-10 px-5 py-12 sm:px-8 sm:py-16 lg:col-span-9 lg:flex lg:min-h-[46rem] lg:flex-col lg:justify-center lg:px-0 lg:py-24">
            <div className="mb-8 flex items-center gap-4 text-xs font-semibold uppercase text-[#9ad1bf]">
              <span>04</span>
              <span className="h-px w-16 bg-[#9ad1bf]/55" />
              <span>{copy.hero.eyebrow}</span>
            </div>
            <h1 className="max-w-5xl font-heading text-[clamp(3.6rem,7.5vw,7.4rem)] font-semibold leading-[0.9] text-balance">
              {copy.hero.title}
            </h1>
            <div className="mt-10 grid gap-8 lg:grid-cols-9 lg:items-end">
              <p className="max-w-xl text-lg leading-8 text-white/72 lg:col-span-5">
                {copy.hero.description}
              </p>
              <Link
                href={publicPath(locale, copy.hero.cta.slug)}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group min-h-12 w-full gap-3 bg-[#dc395f] text-white hover:bg-[#f04b70] sm:w-fit lg:col-span-4",
                )}
              >
                {copy.hero.cta.label}
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </div>

          <aside className="relative z-20 mx-5 mb-8 border-t-4 border-[#81b764] bg-[#fbfaf6] p-5 text-[#14333b] shadow-2xl sm:mx-8 sm:p-7 lg:absolute lg:bottom-10 lg:right-10 lg:mb-0 lg:ml-0 lg:w-[25rem]">
            <p className="mb-4 text-xs font-semibold uppercase text-[#179191]">{routeLabel}</p>
            <ol className="divide-y divide-black/10 border-y border-black/10">
              {pathway.map((item, index) => (
                <li key={item} className="flex items-center gap-4 py-3">
                  <span className="font-heading text-xs font-semibold text-[#dc395f]">0{index + 1}</span>
                  <span className="font-heading font-semibold">{item}</span>
                  {index < pathway.length - 1 ? <ArrowDown className="ml-auto size-4 text-[#179191]" aria-hidden /> : null}
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      <div className="partner-signal-rail overflow-hidden border-y border-black/10 bg-[#81b764] py-4 text-[#14333b]" aria-label={routeLabel}>
        <div className="partner-signal-track flex w-max items-center">
          {[0, 1].map((set) => (
            <div key={set} className="flex shrink-0 items-center" aria-hidden={set === 1}>
              {signalWords.map((word, index) => (
                <span key={`${set}-${word}`} className="flex items-center font-heading text-lg font-semibold uppercase sm:text-2xl">
                  <span className="px-6 sm:px-10">{word}</span>
                  <span className={cn("size-2 rotate-45", index % 2 === 0 ? "bg-[#dc395f]" : "bg-[#14333b]")} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Section className="border-t-0 py-16 sm:py-24 lg:py-28">
        <div className="mb-12 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mb-4 text-xs font-semibold uppercase text-[#179191]">{locale === "fr" ? "Choisissez votre point d’entrée" : "Choose your point of entry"}</p>
            <h2 className="max-w-4xl font-heading text-4xl font-semibold leading-[1.02] text-balance sm:text-6xl">
              {copy.proposition.title}
            </h2>
          </div>
          <p className="max-w-xl border-l-2 border-[#dc395f] pl-5 text-lg leading-8 text-muted-foreground lg:col-span-4 lg:col-start-9">
            {copy.proposition.description}
          </p>
        </div>

        <div className="hidden grid-cols-12 border-y border-black/20 px-4 py-4 text-xs font-semibold uppercase text-muted-foreground md:grid">
          <span className="col-span-3 col-start-2">{columns.type}</span>
          <span className="col-span-4">{columns.value}</span>
          <span className="col-span-4">{columns.examples}</span>
        </div>
        <ol className="divide-y divide-black/15 border-b border-black/20">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className="partner-route group relative grid gap-5 overflow-hidden px-1 py-7 transition-colors duration-300 hover:bg-[#14333b] hover:text-white sm:px-4 md:grid-cols-12 md:gap-0 md:py-9"
            >
              <span className="relative z-10 font-heading text-3xl font-semibold leading-none text-[#179191] transition-colors group-hover:text-[#81b764] md:col-span-1 md:text-lg">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="relative z-10 font-heading text-2xl font-semibold leading-tight transition-transform duration-300 group-hover:translate-x-2 md:col-span-3 md:pr-8">
                {row.type}
              </h3>
              <div className="relative z-10 md:col-span-4 md:pr-10">
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground transition-colors group-hover:text-white/55 md:hidden">
                  {columns.value}
                </p>
                <p className="text-base leading-7 text-muted-foreground transition-colors group-hover:text-white/72">{row.value}</p>
              </div>
              <div className="relative z-10 md:col-span-4 md:pr-8">
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground transition-colors group-hover:text-white/55 md:hidden">
                  {columns.examples}
                </p>
                <p className="text-base leading-7 text-muted-foreground transition-colors group-hover:text-white/72">{row.examples}</p>
              </div>
              <ArrowUpRight className="absolute bottom-8 right-4 size-5 translate-y-3 text-[#81b764] opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100" aria-hidden />
            </li>
          ))}
        </ol>
      </Section>

      {active.length > 0 ? <Section id="partners" className="scroll-mt-20 border-t">
        <SectionHeading
          title={copy.logos.title}
          className="mx-auto mb-10 max-w-2xl text-center sm:mb-12"
        />
        <PartnersNetwork locale={locale} partners={active} typeRows={rows} />
      </Section> : null}

      {historical.length > 0 ? (
        <Section className="border-t">
          <SectionHeading
            title={labels.historicalTitle}
            description={labels.historicalDescription}
            className="mx-auto mb-10 max-w-2xl text-center sm:mb-12"
          />
          <PartnersNetwork
            locale={locale}
            partners={historical}
            typeRows={rows}
          />
        </Section>
      ) : null}

      <section className="relative isolate min-h-[34rem] overflow-hidden bg-[#14333b] text-white">
        <Image src="/asip-media/partners-stage.webp" alt={locale === "fr" ? "Rencontre de partenaires et fondateurs ASIP" : "ASIP partners and founders meeting on stage"} fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,51,59,.96)_0%,rgba(20,51,59,.82)_48%,rgba(20,51,59,.18)_100%)]" />
        <div className="relative mx-auto flex min-h-[34rem] w-full max-w-7xl items-center px-5 py-16 sm:px-8 lg:px-10">
          <div className="max-w-3xl border-l-4 border-[#dc395f] pl-6 sm:pl-9">
            <p className="mb-4 text-xs font-semibold uppercase text-[#9ad1bf]">{locale === "fr" ? "Construire la prochaine connexion" : "Build the next connection"}</p>
            <h2 className="font-heading text-4xl font-semibold leading-[1.02] text-balance sm:text-6xl">{copy.ctaSection.title}</h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">{copy.ctaSection.description}</p>
            <Link href={publicPath(locale, copy.ctaSection.slug)} className={cn(buttonVariants({ size: "lg" }), "group mt-8 min-h-12 gap-3 bg-[#81b764] text-[#14333b] hover:bg-[#9ccc83]")}>
              {copy.ctaSection.label}
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
