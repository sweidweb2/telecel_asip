import type { ReactNode } from "react";

import { AmbientMusicControl } from "@/components/layout/ambient-music-control";
import { ApplicationStatusBanner } from "@/components/layout/application-status-banner";
import {
  enFooterLabels,
  frFooterLabels,
} from "@/components/layout/site-footer-labels";
import { SiteFooter } from "@/components/layout/site-footer";
import { navLabelsFor } from "@/components/layout/site-nav-labels";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { getAuthUser } from "@/lib/admin/get-auth-user";
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
  const [locale, openApplications, user] = await Promise.all([
    localeFromParams(params),
    getOpenApplications(),
    getAuthUser(),
  ]);
  const footerLabels =
    locale === "fr"
      ? frFooterLabels(openApplications)
      : enFooterLabels(openApplications);

  return (
    <div className="flex flex-1 flex-col scheme-light">
      <SiteNavbar
        locale={locale}
        labels={navLabelsFor(locale, openApplications)}
        email={user?.email ?? null}
      />
      <ApplicationStatusBanner
        locale={locale}
        openApplications={openApplications}
      />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter labels={footerLabels} />
      <AmbientMusicControl />
    </div>
  );
}
