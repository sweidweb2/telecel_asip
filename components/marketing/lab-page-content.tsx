import { HomeMapFlipperSection } from "@/components/marketing/home-map-flipper-section";
import type { Locale } from "@/constants/locales";

type LabPageContentProps = {
  locale: Locale;
};

/**
 * Temporary playground for marketing sections parked for later reuse.
 * Not indexed; linked in the navbar while iterating.
 */
export function LabPageContent({ locale }: LabPageContentProps) {
  const title = locale === "fr" ? "Labo de sections" : "Sections lab";
  const intro =
    locale === "fr"
      ? "Sections marketing en réserve — à réutiliser plus tard."
      : "Parked marketing sections — reuse later.";

  return (
    <main>
      <section className="border-b border-border px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Dev · Temporary
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {intro}
          </p>
        </div>
      </section>

      <HomeMapFlipperSection />
    </main>
  );
}
