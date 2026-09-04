import Link from "next/link";
import {
  Eye,
  Handshake,
  HeartHandshake,
  MessagesSquare,
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
import { MARKETING_MEDIA } from "@/constants/marketing-media";
import { publicPath } from "@/constants/routes";
import type {
  AlumniBenefitId,
  AlumniPageCopy,
} from "@/types/marketing-page";
import { cn } from "@/lib/utils";

const BENEFIT_ICONS: Record<AlumniBenefitId, LucideIcon> = {
  community: Users,
  learning: MessagesSquare,
  opportunities: Handshake,
  visibility: Eye,
  "give-back": HeartHandshake,
};

type AlumniPageContentProps = {
  locale: Locale;
  copy: AlumniPageCopy;
};

function AlumniCta({
  locale,
  cta,
}: {
  locale: Locale;
  cta: AlumniPageCopy["hero"]["primaryCta"];
}) {
  return (
    <Link
      href={publicPath(locale, cta.slug)}
      className={cn(
        buttonVariants({ size: "lg" }),
        "min-h-11 w-full sm:w-auto",
      )}
    >
      {cta.label}
    </Link>
  );
}

export function AlumniPageContent({ locale, copy }: AlumniPageContentProps) {
  return (
    <main>
      <PageHero
        variant="poster"
        marker="ALUMNI"
        media={MARKETING_MEDIA.alumni}
        locale={locale}
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        description={copy.hero.description}
        action={<AlumniCta locale={locale} cta={copy.hero.primaryCta} />}
      />

      <Section id="community" className="scroll-mt-20 border-t">
        <SectionHeading
          title={copy.purpose.title}
          description={copy.purpose.description}
          className="max-w-3xl"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {copy.benefits.items.map((item) => {
            const Icon = BENEFIT_ICONS[item.id];

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
        {copy.notice ? <p className="max-w-3xl border-l-2 border-primary pl-4 text-sm text-muted-foreground">{copy.notice}</p> : null}
        <div className="mt-10">
          <AlumniCta locale={locale} cta={copy.hero.primaryCta} />
        </div>
      </Section>
    </main>
  );
}
