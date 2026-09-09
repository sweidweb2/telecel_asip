import type { ReactNode } from "react";
import Image from "next/image";

import type { Locale } from "@/constants/locales";
import type { MarketingMedia } from "@/constants/marketing-media";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  action,
  children,
  media,
  locale = "en",
  variant = "cinematic",
  marker,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  children?: ReactNode;
  media?: MarketingMedia;
  locale?: Locale;
  variant?: "cinematic" | "split" | "split-left" | "poster" | "index" | "magazine" | "quiet";
  marker?: string;
}) {
  const slot = children ?? action;

  if (variant === "split" || variant === "split-left") {
    const mediaBlock = media ? (
      <figure className="relative min-h-[20rem] overflow-hidden bg-asip-ink lg:min-h-[34rem]">
        <Image
          src={media.src}
          alt={media.alt[locale]}
          fill
          priority
          loading="eager"
          className="home-hero-motion object-cover"
          style={{ objectPosition: media.position }}
          sizes="(max-width: 1024px) 100vw, 42vw"
        />
        <span className="absolute inset-x-0 bottom-0 h-2 bg-asip-magenta" aria-hidden />
      </figure>
    ) : null;

    return (
      <section className="border-b border-black/10 bg-background text-foreground">
        <div className="mx-auto grid w-full max-w-7xl lg:grid-cols-12">
          {variant === "split-left" ? (
            <div className="lg:col-span-5">{mediaBlock}</div>
          ) : null}
          <div data-hero-copy className="flex min-h-[30rem] flex-col justify-end px-5 py-12 sm:px-8 sm:py-16 lg:col-span-7 lg:px-10 lg:py-20">
            {eyebrow ? <p className="mb-5 text-xs font-semibold uppercase text-brand">{eyebrow}</p> : null}
            <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-[1.04] text-balance sm:text-6xl">{title}</h1>
            <p className="mt-6 max-w-2xl border-l-2 border-asip-coral pl-5 text-lg leading-8 text-foreground/72 sm:text-xl">{description}</p>
            {slot ? <div className="mt-8">{slot}</div> : null}
          </div>
          {variant === "split" ? (
            <div className="lg:col-span-5">{mediaBlock}</div>
          ) : null}
        </div>
      </section>
    );
  }

  if (variant === "magazine") {
    return (
      <section className="overflow-hidden border-b border-black/10 bg-background text-foreground">
        <div className="mx-auto w-full max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16 lg:px-10">
          <div data-hero-copy className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              {eyebrow ? <p className="mb-5 text-xs font-semibold uppercase text-asip-magenta">{eyebrow}</p> : null}
              <h1 className="font-heading text-5xl font-semibold leading-[1.02] text-balance sm:text-7xl">{title}</h1>
            </div>
            <div className="pb-2 lg:col-span-4">
              <p className="text-lg leading-8 text-foreground/70">{description}</p>
              {slot ? <div className="mt-6">{slot}</div> : null}
            </div>
          </div>
          {media ? (
            <figure data-reveal="media" className="relative mt-8 aspect-[16/7] min-h-64 overflow-hidden border-t-8 border-brand">
              <Image src={media.src} alt={media.alt[locale]} fill priority loading="eager" className="object-cover" style={{ objectPosition: media.position }} sizes="(max-width: 1280px) 100vw, 1280px" />
            </figure>
          ) : null}
        </div>
      </section>
    );
  }

  if (variant === "quiet") {
    return (
      <section className="border-b border-black/10 bg-white text-foreground">
        <div data-hero-copy className="mx-auto grid min-h-[20rem] w-full max-w-7xl items-end gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-7">
            {eyebrow ? <p className="mb-5 text-xs font-semibold uppercase text-brand">{eyebrow}</p> : null}
            <h1 className="font-heading text-5xl font-semibold leading-[1.03] text-balance sm:text-7xl">{title}</h1>
          </div>
          <div className="border-t-2 border-asip-ink pt-5 lg:col-span-4 lg:col-start-9">
            <p className="text-lg leading-8 text-foreground/70">{description}</p>
            {slot ? <div className="mt-6">{slot}</div> : null}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "poster") {
    return (
      <section className="overflow-hidden bg-[#14333b] text-white">
        <div className="mx-auto grid w-full max-w-7xl lg:grid-cols-12">
          <div data-hero-copy className="relative flex min-h-[34rem] flex-col justify-end overflow-hidden px-5 py-12 sm:px-8 sm:py-16 lg:col-span-7 lg:px-10 lg:py-20">
            {marker ? <span className="pointer-events-none absolute right-6 top-6 font-heading text-7xl font-semibold text-white/7 sm:text-9xl" aria-hidden>{marker}</span> : null}
            {eyebrow ? <p className="relative mb-5 text-xs font-semibold uppercase text-asip-mint">{eyebrow}</p> : null}
            <h1 className="relative max-w-3xl font-heading text-5xl font-semibold leading-[1.02] text-balance sm:text-7xl">{title}</h1>
            <p className="relative mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">{description}</p>
            {slot ? <div className="relative mt-8">{slot}</div> : null}
          </div>
          {media ? (
            <figure data-reveal="media" className="relative min-h-[24rem] border-t-8 border-brand-mid lg:col-span-5 lg:min-h-[34rem] lg:border-l-8 lg:border-t-0">
              <Image src={media.src} alt={media.alt[locale]} fill priority loading="eager" className="home-hero-motion object-cover" style={{ objectPosition: media.position }} sizes="(max-width: 1024px) 100vw, 42vw" />
            </figure>
          ) : null}
        </div>
      </section>
    );
  }

  if (variant === "index") {
    return (
      <section className="relative isolate overflow-hidden bg-[#14333b] text-white">
        {media ? (
          <div className="absolute inset-0" aria-hidden>
            <Image src={media.src} alt="" fill priority loading="eager" className="object-cover" style={{ objectPosition: media.position }} sizes="100vw" />
            <div className="absolute inset-0 bg-[#14333b]/68" />
            <div className="absolute inset-y-0 left-0 w-2/3 bg-[#14333b]/55" />
          </div>
        ) : null}
        <div className="relative mx-auto grid min-h-[26rem] w-full max-w-7xl grid-cols-12 items-end px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <div data-hero-copy className="col-span-12 border-l-4 border-asip-coral pl-6 lg:col-span-9">
            {eyebrow ? <p className="mb-5 text-xs font-semibold uppercase text-asip-mint">{eyebrow}</p> : null}
            <h1 className="font-heading text-5xl font-semibold leading-[1.02] text-balance sm:text-7xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">{description}</p>
            {slot ? <div className="mt-7">{slot}</div> : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate overflow-hidden bg-[#14333b] text-white">
      {media ? (
        <div className="absolute inset-0" aria-hidden>
          <Image src={media.src} alt="" fill priority loading="eager" className="home-hero-motion object-cover" style={{ objectPosition: media.position }} sizes="100vw" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,51,59,.96)_0%,rgba(20,51,59,.82)_43%,rgba(20,51,59,.16)_78%,rgba(20,51,59,.05)_100%)]" />
        </div>
      ) : null}
      <div className="relative mx-auto grid min-h-[30rem] w-full max-w-7xl grid-cols-12 items-end px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div data-hero-copy className="col-span-12 max-w-3xl lg:col-span-8">
          {eyebrow ? <p className="mb-5 text-xs font-semibold uppercase text-asip-mint">{eyebrow}</p> : null}
          <h1 className="font-heading text-4xl font-semibold leading-[1.06] text-balance sm:text-6xl lg:text-7xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">{description}</p>
          {slot ? <div className="mt-8">{slot}</div> : null}
          {media ? <span className="sr-only">{media.alt[locale]}</span> : null}
        </div>
      </div>
    </section>
  );
}
export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      data-reveal="section"
      className={cn("mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20", className)}
    >
      {children}
    </section>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-10 max-w-3xl", className)}>
      {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase text-primary">{eyebrow}</p> : null}
      <h2 className="font-heading text-3xl font-semibold leading-tight text-balance sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p> : null}
    </div>
  );
}
