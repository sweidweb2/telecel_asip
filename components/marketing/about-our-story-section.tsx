import Image from "next/image";
import {
  Globe,
  Heart,
  Rocket,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { StoryStatCounter } from "@/components/marketing/story-stat-counter";
import type { Locale } from "@/constants/locales";
import type {
  AboutStoryCopy,
  AboutStoryFeatureIcon,
} from "@/types/marketing-page";
import { cn } from "@/lib/utils";

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
  icon,
  title,
  description,
  className,
}: {
  icon: AboutStoryFeatureIcon;
  title: string;
  description: string;
  className?: string;
}) {
  const Icon = FEATURE_ICONS[icon];

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
    </article>
  );
}

function StoryHeroVisual({ locale }: { locale: Locale }) {
  return (
    <div className="group relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border-2 border-border bg-muted shadow-sm lg:max-w-none">
      <Image
        src="/asip-media/founders-community.webp"
        alt={
          locale === "fr"
            ? "Fondateurs ASIP et communauté du programme"
            : "ASIP founders and program community"
        }
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        style={{ objectPosition: "center 42%" }}
        sizes="(max-width: 1024px) 24rem, 33vw"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />

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
    <section id="our-story" className="relative scroll-mt-20 overflow-visible">
      <span
        aria-hidden
        className="pointer-events-none absolute -left-56 top-8 h-[34rem] w-[30rem] rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--brand)_8%,transparent)_0%,color-mix(in_srgb,var(--brand)_3.5%,transparent)_42%,transparent_76%)] blur-[52px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-32 size-72 rounded-full bg-primary/8 blur-3xl"
      />

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
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
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
            <StoryHeroVisual locale={locale} />
          </div>

          <div className="order-3 flex flex-col gap-5 lg:gap-6">
            {rightFeatures.map((feature, index) => (
              <StoryFeatureItem
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
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

    </section>
  );
}
