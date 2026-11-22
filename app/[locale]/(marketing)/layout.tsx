import type { ReactNode } from "react";

import "./marketing.css";

import { AmbientMusicControlLazy } from "@/components/layout/ambient-music-control-lazy";
import { ApplicationStatusBanner } from "@/components/layout/application-status-banner";
import { footerLabelsFor } from "@/components/layout/site-footer-labels";
import { SiteFooter } from "@/components/layout/site-footer";
import { navLabelsFor } from "@/components/layout/site-nav-labels";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { getOpenApplications } from "@/data/settings";
import { localeFromParams } from "@/lib/i18n/locale-params";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function MarketingLayout({
  children,
  params,
}: LayoutProps) {
  const [locale, openApplications] = await Promise.all([
    localeFromParams(params),
    getOpenApplications(),
  ]);
  const footerLabels = footerLabelsFor(locale, openApplications);

  return (
    <div data-marketing className="flex flex-1 flex-col scheme-light">
      <SiteNavbar
        locale={locale}
        labels={navLabelsFor(locale, openApplications)}
      />
      <ApplicationStatusBanner
        locale={locale}
        openApplications={openApplications}
      />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter labels={footerLabels} />
      <AmbientMusicControlLazy />
    </div>
  );
}
