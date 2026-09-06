import type { ReactNode } from "react";
import { format, parseISO } from "date-fns";

import { PageCtaSection } from "@/components/marketing/page-cta-section";
import { ProgrammeAudienceSection } from "@/components/marketing/programme-audience-section";
import { ProgrammeEligibilitySection } from "@/components/marketing/programme-eligibility-section";
import { ProgrammeHero } from "@/components/marketing/programme-hero";
import { ProgrammeJourneySection } from "@/components/marketing/programme-journey-section";
import { ProgrammeValueSection } from "@/components/marketing/programme-value-section";
import type { Locale } from "@/constants/locales";
import { programmeCopyFor } from "@/constants/programme-copy";
import { intakeCtaFor } from "@/lib/marketing/intake-cta";
import type { CohortPublicListItem } from "@/types/cohort";

function PageSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {note ? `${title} · ${note}` : title}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h2>
        <div className="mt-4 min-h-24 rounded-md border border-dashed border-muted-foreground/35 bg-muted/40 p-4 sm:p-6">
          {children}
        </div>
      </div>
    </section>
  );
}

function formatCohortWindow(cohort: CohortPublicListItem, locale: Locale) {
  if (!cohort.programme_dates_start || !cohort.programme_dates_end) {
    return null;
  }
  try {
    const start = format(parseISO(cohort.programme_dates_start), "MMM yyyy");
    const end = format(parseISO(cohort.programme_dates_end), "MMM yyyy");
    return locale === "fr" ? `${start} – ${end}` : `${start} – ${end}`;
  } catch {
    return null;
  }
}

function programmeStatusLabel(
  status: CohortPublicListItem["programme_status"],
  locale: Locale,
) {
  if (locale === "fr") {
    if (status === "open") return "Ouvert";
    if (status === "hold") return "En attente";
    return "Clôturé";
  }
  if (status === "open") return "Open";
  if (status === "hold") return "On hold";
  return "Closed";
}

type ProgrammePageContentProps = {
  locale: Locale;
  cohorts: CohortPublicListItem[];
  openApplications: boolean;
};

/**
 * Programme marketing page — mostly static (build spec §4).
 * Published cohorts fill the past-chapters list until full design lands.
 */
export function ProgrammePageContent({
  locale,
  cohorts,
  openApplications,
}: ProgrammePageContentProps) {
  const copy = programmeCopyFor(locale);
  const intake = intakeCtaFor(locale, openApplications);
  const pastTitle = locale === "fr" ? "Chapitres publiés" : "Past chapters";

  return (
    <main>
      <ProgrammeHero
        locale={locale}
        copy={copy.hero}
        openApplications={openApplications}
      />

      <ProgrammeAudienceSection
        locale={locale}
        copy={copy.audience}
        openApplications={openApplications}
      />

      <ProgrammeJourneySection copy={copy.journey} />

      <ProgrammeValueSection copy={copy.value} />

      <ProgrammeEligibilitySection copy={copy.eligibility} />

      <PageSection title={pastTitle} note="Live cohorts">
        {cohorts.length > 0 ? (
          <ul className="space-y-4">
            {cohorts.map((cohort) => {
              const window = formatCohortWindow(cohort, locale);
              return (
                <li key={cohort.id} className="text-sm sm:text-base">
                  <span className="font-medium">
                    {cohort.year} — {cohort.public_label}
                  </span>
                  <span className="text-muted-foreground">
                    {" · "}
                    {programmeStatusLabel(cohort.programme_status, locale)}
                    {window ? ` · ${window}` : null}
                  </span>
                  {cohort.summary ? (
                    <p className="mt-1 text-muted-foreground">{cohort.summary}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            {locale === "fr"
              ? "Les chapitres publiés apparaîtront ici."
              : "Published chapters will appear here."}
          </p>
        )}
      </PageSection>

      <PageCtaSection
        locale={locale}
        cta={{
          ...copy.ctaSection,
          slug: intake.slug,
          label: intake.label,
          description: openApplications
            ? locale === "fr"
              ? "Les candidatures sont ouvertes. Explorez aussi les fondateurs qui ont déjà construit avec ASIP."
              : "Applications are open. You can also explore founders who have already built through ASIP."
            : copy.ctaSection.description,
        }}
      />
    </main>
  );
}
