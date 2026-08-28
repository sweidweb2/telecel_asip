import Link from "next/link";
import {
  Brain,
  CircleCheck,
  Eye,
  Handshake,
  LineChart,
  Link2,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  PageHero,
  Section,
  SectionHeading,
} from "@/components/marketing/page-elements";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type {
  ProgrammePageCopy,
  ProgrammeValueId,
} from "@/types/marketing-page";
import { cn } from "@/lib/utils";

const VALUE_ICONS: Record<ProgrammeValueId, LucideIcon> = {
  expertise: Brain,
  network: Users,
  intelligence: LineChart,
  investment: TrendingUp,
  commercial: Handshake,
  visibility: Eye,
  continuity: Link2,
};

type ProgrammePageContentProps = {
  locale: Locale;
  copy: ProgrammePageCopy;
};

function ProgrammeCtas({
  locale,
  primary,
  secondary,
}: {
  locale: Locale;
  primary: ProgrammePageCopy["hero"]["primaryCta"];
  secondary: ProgrammePageCopy["hero"]["secondaryCta"];
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Link
        href={publicPath(locale, primary.slug)}
        className={cn(
          buttonVariants({ size: "lg" }),
          "min-h-11 w-full sm:w-auto",
        )}
      >
        {primary.label}
      </Link>
      <Link
        href={publicPath(locale, secondary.slug)}
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "min-h-11 w-full sm:w-auto",
        )}
      >
        {secondary.label}
      </Link>
    </div>
  );
}

export function ProgrammePageContent({
  locale,
  copy,
}: ProgrammePageContentProps) {
  return (
    <main>
      <PageHero
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        description={copy.hero.description}
        action={
          <ProgrammeCtas
            locale={locale}
            primary={copy.hero.primaryCta}
            secondary={copy.hero.secondaryCta}
          />
        }
      />

      <Section className="border-t">
        <SectionHeading
          eyebrow={copy.audience.eyebrow}
          title={copy.audience.title}
          description={copy.audience.description}
          className="mb-0 max-w-3xl"
        />
      </Section>

      <Section className="border-t">
        <SectionHeading title={copy.journey.title} />
        <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {copy.journey.steps.map((step, index) => (
            <li
              key={step.id}
              className="rounded-xl border bg-card p-5 sm:p-6"
            >
              <span
                aria-hidden
                className="font-heading text-sm font-semibold tabular-nums tracking-wider text-primary"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-heading text-lg font-semibold tracking-tight sm:text-xl">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="border-t">
        <SectionHeading title={copy.value.title} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {copy.value.items.map((item) => {
            const Icon = VALUE_ICONS[item.id];

            return (
              <article
                key={item.id}
                className="rounded-xl border bg-card p-5 sm:p-6"
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </div>
                <h3 className="font-heading text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </Section>

      <Section className="border-t pb-16 sm:pb-20 lg:pb-24">
        <SectionHeading title={copy.eligibility.title} />
        <ul className="max-w-3xl space-y-3">
          {copy.eligibility.items.map((item) => (
            <li key={item} className="flex gap-3">
              <CircleCheck
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden
              />
              <span className="leading-7 text-pretty">{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-3xl rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {copy.eligibility.notice}
        </p>
        <div className="mt-10">
          <ProgrammeCtas
            locale={locale}
            primary={copy.hero.primaryCta}
            secondary={copy.hero.secondaryCta}
          />
        </div>
      </Section>
    </main>
  );
}
