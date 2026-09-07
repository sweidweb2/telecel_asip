import type { ReactNode } from "react";
import type { Metadata } from "next";

import { ApplicationStatusBanner } from "@/components/layout/application-status-banner";
import {
  enFooterLabels,
  frFooterLabels,
} from "@/components/layout/site-footer-labels";
import { SiteFooter } from "@/components/layout/site-footer";
import { navLabelsFor } from "@/components/layout/site-nav-labels";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { getOpenApplications } from "@/data/settings";
import { localeFromParams } from "@/lib/i18n/locale-params";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AuthLayout({ children, params }: LayoutProps) {
  const [locale, openApplications] = await Promise.all([
    localeFromParams(params),
    getOpenApplications(),
  ]);
  const footerLabels =
    locale === "fr"
      ? frFooterLabels(openApplications)
      : enFooterLabels(openApplications);

  return (
    <>
      <SiteNavbar
        locale={locale}
        labels={navLabelsFor(locale, openApplications)}
      />
      <ApplicationStatusBanner
        locale={locale}
        openApplications={openApplications}
      />
      <div className="flex flex-1 flex-col scheme-light">{children}</div>
      <SiteFooter labels={footerLabels} />
    </>
  );
}
