import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Globe,
  Heart,
  Rocket,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { StoryStatCounter } from "@/components/marketing/story-stat-counter";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import type { PublicPageSlug } from "@/constants/public-pages";
import { publicPath } from "@/constants/routes";
import type {
  AboutStoryCopy,
  AboutStoryFeatureIcon,
} from "@/types/marketing-page";
import { cn } from "@/lib/utils";
import { MARKETING_MEDIA } from "@/constants/marketing-media";

const FEATURE_ICONS: Record<AboutStoryFeatureIcon, LucideIcon> = {
  rocket: Rocket,
  "trending-up": TrendingUp,
  globe: Globe,
  heart: Heart,
};

type AboutOurStorySectionProps = {
  locale: Locale;
  story: AboutStoryCopy;
};

function StoryFeatureItem({
  locale,
  icon,
  title,
  description,
  slug,
  hash,
  linkLabel,
  className,
}: {
  locale: Locale;
  icon: AboutStoryFeatureIcon;
  title: string;
  description: string;
  slug?: PublicPageSlug;
  hash?: string;
  linkLabel?: string;
  className?: string;
}) {
  const Icon = FEATURE_ICONS[icon];
  const href = slug
    ? `${publicPath(locale, slug)}${hash ? `#${hash}` : ""}`
    : null;

  return (
    <article
      className={cn(
        "group rounded-xl border bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-md sm:p-6",
        className,
      )}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-6" aria-hidden />
      </div>
      <h3 className="font-heading text-lg font-semibold tracking-tight">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
        {description}
      </p>
      {href && linkLabel ? (
        <Link
          href={href}
          className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
        >
          {linkLabel}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </article>
  );
}

function StoryHeroVisual({
  locale,
  imageCta,
}: {
  locale: Locale;
  imageCta?: AboutStoryCopy["imageCta"];
}) {
  return (
    <div className="group relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-lg bg-[#14333b] lg:max-w-none">
      <Image src={MARKETING_MEDIA.about.src} alt={MARKETING_MEDIA.about.alt[locale]} fill className="object-cover" style={{ objectPosition: MARKETING_MEDIA.about.position }} sizes="(max-width: 1024px) 90vw, 33vw" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(20,51,59,.72),transparent_58%)]" />

      {imageCta ? (
        <div className="absolute inset-x-0 bottom-0 flex justify-center p-5 opacity-100 transition-opacity sm:p-6 sm:opacity-0 sm:group-hover:opacity-100">
          <Link
            href={publicPath(locale, imageCta.slug)}
            className={cn(
              buttonVariants({ size: "lg" }),
              "min-h-11 w-full shadow-lg sm:w-auto",
            )}
          >
            {imageCta.label}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function AboutOurStorySection({
  locale,
  story,
}: AboutOurStorySectionProps) {
  const features = story.features ?? [];
  const leftFeatures = features.slice(0, 2);
  const rightFeatures = features.slice(2, 4);

  return (
    <section id="our-story" className="relative scroll-mt-20 overflow-hidden">
      <div className="relative text-center">
        {story.eyebrow ? (
          <p className="about-story-fade-up mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {story.eyebrow}
          </p>
        ) : null}
        <h2 className="about-story-fade-up about-story-fade-up-delay-1 font-heading text-3xl font-semibold uppercase tracking-tight text-balance sm:text-4xl">
          {story.title}
        </h2>
        <span
          aria-hidden
          className="about-story-underline mx-auto mt-4 block h-1 w-16 rounded-full bg-primary"
        />
        {story.paragraphs.length > 0 ? (
          <div className="about-story-fade-up about-story-fade-up-delay-2 mx-auto mt-6 flex max-w-3xl flex-col gap-5 sm:mt-8 sm:gap-6">
            {story.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      {features.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:mt-14 lg:mt-16 lg:grid-cols-3 lg:items-center lg:gap-8">
          <div className="order-2 flex flex-col gap-5 lg:order-1 lg:gap-6">
            {leftFeatures.map((feature, index) => (
              <StoryFeatureItem
                key={feature.title}
                locale={locale}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                slug={feature.slug}
                hash={feature.hash}
                linkLabel={feature.linkLabel}
                className={cn(
                  "about-story-fade-up",
                  index === 0
                    ? "about-story-fade-up-delay-3"
                    : "about-story-fade-up-delay-4",
                )}
              />
            ))}
          </div>

          <div className="order-1 about-story-fade-up about-story-fade-up-delay-3 lg:order-2">
            <StoryHeroVisual locale={locale} imageCta={story.imageCta} />
          </div>

          <div className="order-3 flex flex-col gap-5 lg:gap-6">
            {rightFeatures.map((feature, index) => (
              <StoryFeatureItem
                key={feature.title}
                locale={locale}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                slug={feature.slug}
                hash={feature.hash}
                linkLabel={feature.linkLabel}
                className={cn(
                  "about-story-fade-up",
                  index === 0
                    ? "about-story-fade-up-delay-4"
                    : "about-story-fade-up-delay-5",
                )}
              />
            ))}
          </div>
        </div>
      ) : null}

      {story.stats && story.stats.length > 0 ? (
        <div className="mt-12 sm:mt-14 lg:mt-20">
          <StoryStatCounter stats={story.stats} />
        </div>
      ) : null}

      {story.bottomCta ? (
        <div className="about-story-fade-up about-story-fade-up-delay-5 mt-12 flex flex-col items-center gap-4 text-center sm:mt-14 lg:mt-16">
          <p className="max-w-md font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            {story.bottomCta.title}
          </p>
          <Link
            href={publicPath(locale, story.bottomCta.slug)}
            className={cn(buttonVariants(), "min-h-11 w-full sm:w-auto")}
          >
            {story.bottomCta.label}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
