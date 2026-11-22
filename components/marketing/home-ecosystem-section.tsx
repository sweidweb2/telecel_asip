import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Cpu,
  GraduationCap,
  Handshake,
  Network,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { SectionEyebrow } from "@/components/marketing/page-elements";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type {
  HomePageCopy,
  HomePartnerRoleId,
} from "@/types/marketing-page";

const ROLE_ICONS: Record<HomePartnerRoleId, LucideIcon> = {
  mentors: GraduationCap,
  investors: TrendingUp,
  corporates: Building2,
  technology: Cpu,
  institutions: Handshake,
  ecosystem: Network,
};

type HomeEcosystemSectionProps = {
  locale: Locale;
  copy: HomePageCopy["ecosystem"];
  className?: string;
};

/**
 * Home Module 06 — Ecosystem.
 * Six partner roles in a light hover grid; CTA to Partners.
 * `id="investors"` is the hero Investor pathway anchor until Block B
 * adds a dedicated investor module.
 */
export function HomeEcosystemSection({
  locale,
  copy,
  className,
}: HomeEcosystemSectionProps) {
  const ctaHref = publicPath(locale, copy.cta.slug);

  return (
    <section
      id="investors"
      aria-labelledby="home-ecosystem-heading"
      className={cn(
        "relative scroll-mt-24 overflow-hidden border-y border-border bg-background",
        "px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow>Ecosystem</SectionEyebrow>
          <h2
            id="home-ecosystem-heading"
            className="mt-3 font-heading text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl lg:text-4xl"
          >
            {copy.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {copy.description}
          </p>
        </div>

        <ul className="relative z-10 mx-auto mt-10 grid auto-rows-fr grid-cols-1 items-stretch md:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {copy.roles.map((role, index) => {
            const Icon = ROLE_ICONS[role.id];

            return (
              <li key={role.id} className="flex h-full min-h-0">
                <EcosystemRole
                  title={role.title}
                  description={role.description}
                  icon={Icon}
                  index={index}
                  isLast={index === copy.roles.length - 1}
                />
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex justify-center sm:mt-12">
          <Link
            href={ctaHref}
            className={cn(
              buttonVariants({ size: "lg" }),
              "min-h-11 w-full rounded-full px-8 sm:w-auto",
            )}
          >
            {copy.cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

function EcosystemRole({
  title,
  description,
  icon: Icon,
  index,
  isLast,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  index: number;
  isLast: boolean;
}) {
  const isTopRowLg = index < 3;

  return (
    <article
      className={cn(
        "group/feature relative flex h-full w-full flex-col border-border py-8 sm:py-10",
        !isLast && "border-b",
        "md:border-r",
        index % 2 === 0 && "md:border-l",
        index < 4 && "md:border-b",
        "lg:border-r",
        (index === 0 || index === 3) && "lg:border-l",
        isTopRowLg ? "lg:border-b" : "lg:border-b-0",
        index % 3 === 2 && "lg:border-r-0",
        index % 2 === 1 && "md:border-r-0",
      )}
    >
      {isTopRowLg ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-muted/80 to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100"
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-muted/80 to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100"
        />
      )}

      <div className="relative z-10 mb-4 px-6 text-muted-foreground transition-colors duration-200 group-hover/feature:text-brand sm:px-8 lg:px-10">
        <Icon className="size-6" strokeWidth={1.5} aria-hidden />
      </div>

      <div className="relative z-10 mb-2 px-6 sm:px-8 lg:px-10">
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 h-6 w-1 origin-center rounded-tr-full rounded-br-full bg-border transition-all duration-200 group-hover/feature:h-8 group-hover/feature:bg-asip-coral"
        />
        <h3 className="inline-block font-heading text-lg font-semibold tracking-tight text-foreground transition duration-200 group-hover/feature:translate-x-2">
          {title}
        </h3>
      </div>

      <p className="relative z-10 max-w-xs px-6 text-sm leading-6 text-muted-foreground sm:px-8 lg:px-10">
        {description}
      </p>
    </article>
  );
}
