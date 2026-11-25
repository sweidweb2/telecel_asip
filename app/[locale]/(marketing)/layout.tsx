import type { ReactNode } from "react";

import "./marketing.css";

import { AmbientMusicControlLazy } from "@/components/layout/ambient-music-control-lazy";
import { footerLabelsFor } from "@/components/layout/site-footer-labels";
import { SiteFooter } from "@/components/layout/site-footer";
import { navLabelsFor } from "@/components/layout/site-nav-labels";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { getCurrentUserProfile } from "@/data/users";
import { getOpenApplications } from "@/data/settings";
import { localeFromParams } from "@/lib/i18n/locale-params";
import {
  portalCtaFor,
  rolePrimaryCtaFor,
} from "@/lib/marketing/role-primary-cta";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function MarketingLayout({
  children,
  params,
}: LayoutProps) {
  const [locale, openApplications, profile] = await Promise.all([
    localeFromParams(params),
    getOpenApplications(),
    getCurrentUserProfile(),
  ]);
  const footerLabels = footerLabelsFor(locale, openApplications);
  const navLabels = navLabelsFor(locale, openApplications);
  const primaryCta = rolePrimaryCtaFor({
    locale,
    openApplications,
    profile,
  });
  const portalCta = portalCtaFor(profile, locale);
  navLabels.apply = primaryCta;
  footerLabels.apply = primaryCta;

  return (
    <div data-marketing className="flex flex-1 flex-col scheme-light">
      <SiteNavbar
        locale={locale}
        labels={navLabels}
        accountEmail={profile?.email ?? null}
        accountFullName={profile?.full_name ?? null}
        portalHref={portalCta?.href ?? null}
        portalLabel={portalCta?.label ?? null}
      />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter labels={footerLabels} />
      <AmbientMusicControlLazy />
    </div>
  );
}
