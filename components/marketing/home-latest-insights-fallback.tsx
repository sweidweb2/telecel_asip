import { SectionEyebrow } from "@/components/marketing/page-elements";
import { homeV2CopyFor } from "@/constants/home-v2-copy";
import type { Locale } from "@/constants/locales";

type HomeLatestInsightsFallbackProps = {
  locale: Locale;
};

/** Lightweight chrome while latest insights stream in. */
export function HomeLatestInsightsFallback({
  locale,
}: HomeLatestInsightsFallbackProps) {
  const copy = homeV2CopyFor(locale);

  return (
    <section
      aria-busy="true"
      aria-label={copy.latest.title}
      className="border-t border-border bg-background px-4 pt-8 pb-14 sm:px-6 sm:pt-10 sm:pb-16 lg:px-8 lg:pt-12 lg:pb-20"
    >
      <div className="mx-auto w-full max-w-7xl">
        <SectionEyebrow>{copy.latest.eyebrow}</SectionEyebrow>
        <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl lg:text-4xl">
          {copy.latest.title}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-lg bg-muted/60"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
