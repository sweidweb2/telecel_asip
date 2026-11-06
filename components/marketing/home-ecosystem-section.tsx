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

import {
  BentoCard,
  BentoGrid,
  BentoIcon,
} from "@/components/marketing/bento";
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

type RoleLayout = {
  span: 2 | 3 | 4;
  tone: "card" | "mint" | "ink" | "blush";
};

/**
 * Bento rhythm on desktop (six columns): 4+2, 2+4, 3+3. Two colour cards,
 * one ink card; the rest stay quiet so the grid still reads as one system.
 */
const ROLE_LAYOUT: Record<HomePartnerRoleId, RoleLayout> = {
  mentors: { span: 4, tone: "mint" },
  investors: { span: 2, tone: "ink" },
  corporates: { span: 2, tone: "card" },
  technology: { span: 4, tone: "card" },
  institutions: { span: 3, tone: "card" },
  ecosystem: { span: 3, tone: "blush" },
};

type HomeEcosystemSectionProps = {
  locale: Locale;
  copy: HomePageCopy["ecosystem"];
  className?: string;
};

/**
 * Home Module 06 — Ecosystem.
 * Six partner roles in a mixed-size bento grid; CTA to Partners.
 */
export function HomeEcosystemSection({
  locale,
  copy,
  className,
}: HomeEcosystemSectionProps) {
  const ctaHref = publicPath(locale, copy.cta.slug);

  return (
    <section
      id="ecosystem"
      aria-labelledby="home-ecosystem-heading"
      className={cn(
        "relative overflow-hidden border-y border-border bg-background",
        "px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow className="mx-auto">{copy.eyebrow}</SectionEyebrow>
          <h2
            id="home-ecosystem-heading"
            className="mt-4 font-heading text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-balance text-foreground sm:text-4xl lg:text-5xl"
          >
            {copy.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {copy.description}
          </p>
        </div>

        <BentoGrid className="relative z-10 mt-10 lg:mt-12">
          {copy.roles.map((role) => {
            const Icon = ROLE_ICONS[role.id];
            const layout = ROLE_LAYOUT[role.id];
            const onInk = layout.tone === "ink";

            return (
              <BentoCard key={role.id} span={layout.span} tone={layout.tone}>
                <BentoIcon
                  className={cn(onInk && "bg-white/10 text-asip-mint ring-white/15")}
                >
                  <Icon strokeWidth={1.75} />
                </BentoIcon>
                <h3 className="font-heading text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
                  {role.title}
                </h3>
                <p
                  className={cn(
                    "mt-2 max-w-md text-sm leading-6 sm:text-base sm:leading-7",
                    onInk ? "text-white/80" : "text-asip-ink/80",
                  )}
                >
                  {role.description}
                </p>
              </BentoCard>
            );
          })}
        </BentoGrid>

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
