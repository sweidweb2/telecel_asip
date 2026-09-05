import Link from "next/link";

import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";

const COPY = {
  en: {
    closed:
      "The next ASIP chapter is taking shape. Register your interest to hear when applications open.",
    closedCta: "Register interest",
    open: "Applications for the next ASIP cohort are open.",
    openCta: "Apply to ASIP",
  },
  fr: {
    closed:
      "Le prochain chapitre d’ASIP se prépare. Manifestez votre intérêt pour être informé de l’ouverture des candidatures.",
    closedCta: "Manifester mon intérêt",
    open: "Les candidatures pour la prochaine cohorte ASIP sont ouvertes.",
    openCta: "Postuler à ASIP",
  },
} as const;

type ApplicationStatusBannerProps = {
  locale: Locale;
  openApplications: boolean;
};

/**
 * Thin sitewide status strip. Driven by `site_settings.open_applications`.
 * Both /register-interest and /apply stay reachable; this only promotes the CTA.
 */
export function ApplicationStatusBanner({
  locale,
  openApplications,
}: ApplicationStatusBannerProps) {
  const copy = COPY[locale];
  const href = publicPath(
    locale,
    openApplications ? "apply" : "register-interest",
  );
  const message = openApplications ? copy.open : copy.closed;
  const cta = openApplications ? copy.openCta : copy.closedCta;

  return (
    <div className="border-b bg-muted/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <p className="min-w-0 text-pretty text-muted-foreground">{message}</p>
        <Link
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center font-medium text-primary underline-offset-4 hover:underline sm:min-h-0"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}
