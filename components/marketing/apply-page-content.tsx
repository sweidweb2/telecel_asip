import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { ApplyForm } from "@/components/marketing/apply-form";
import {
  applyAuthGateLabelsFor,
  applyLabelsFor,
} from "@/components/marketing/apply-labels";
import { InvestorIntakeForm } from "@/components/marketing/investor-intake-form";
import { investorIntakeLabelsFor } from "@/components/marketing/investor-intake-labels";
import { IntakeAuthGate } from "@/components/marketing/intake-auth-gate";
import { InstitutionalHero } from "@/components/marketing/institutional-hero";
import { PageCtaSection } from "@/components/marketing/page-cta-section";
import { Section, SectionHeading } from "@/components/marketing/page-elements";
import { SiteAccountMenu } from "@/components/layout/site-account-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type { MarketingPageCopy } from "@/types/marketing-page";
import type { ProfileType } from "@/types/profile";

type ApplyPageContentProps = {
  locale: Locale;
  copy: MarketingPageCopy;
  mode: "register" | "apply";
  user: User | null;
  /** From profiles.type — investors get investor intake forms. */
  accountType: ProfileType | null;
  openApplications: boolean;
};

/**
 * Mutual gate: only one intake path is live.
 * - applications closed → register-interest
 * - applications open → apply
 * Investor accounts see investor_interests / investor_engagements forms.
 */
export function ApplyPageContent({
  locale,
  copy,
  mode,
  user,
  accountType,
  openApplications,
}: ApplyPageContentProps) {
  if (mode === "apply" && !openApplications) {
    redirect(publicPath(locale, "register-interest"));
  }
  if (mode === "register" && openApplications) {
    redirect(publicPath(locale, "apply"));
  }

  const isInvestor = accountType === "investor";
  const labels = isInvestor
    ? investorIntakeLabelsFor(locale, mode)
    : applyLabelsFor(locale, mode);
  const gateLabels = applyAuthGateLabelsFor(locale, mode);

  return (
    <main>
      <InstitutionalHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        headingId={
          mode === "register" ? "register-hero-heading" : "apply-hero-heading"
        }
        patternId={mode === "register" ? "register-hero" : "apply-hero"}
        composition={mode === "register" ? "signal" : "gateway"}
        size="default"
      />

      <Section>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <CardTitle>{labels.formTitle}</CardTitle>
                <CardDescription>{labels.formDescription}</CardDescription>
              </div>
              {user?.email ? (
                <SiteAccountMenu email={user.email} locale={locale} />
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {user ? (
              isInvestor ? (
                <InvestorIntakeForm
                  locale={locale}
                  labels={investorIntakeLabelsFor(locale, mode)}
                  mode={mode}
                  defaultEmail={user.email ?? ""}
                />
              ) : (
                <ApplyForm
                  locale={locale}
                  labels={applyLabelsFor(locale, mode)}
                  mode={mode}
                  defaultEmail={user.email ?? ""}
                />
              )
            ) : (
              <IntakeAuthGate locale={locale} mode={mode} labels={gateLabels} />
            )}
          </CardContent>
        </Card>

        {mode === "apply" ? (
          <div className="mt-10">
            <SectionHeading
              title={copy.sectionTitle}
              description={copy.sectionDescription}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {copy.cards.map((card) => (
                <article key={card.title} className="rounded-xl border p-5 sm:p-6">
                  <h2 className="font-heading text-xl font-semibold tracking-tight">{card.title}</h2>
                  <p className="mt-3 leading-7 text-muted-foreground">{card.description}</p>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </Section>

      {mode === "apply" && copy.ctaSection ? (
        <PageCtaSection locale={locale} cta={copy.ctaSection} />
      ) : null}
    </main>
  );
}
