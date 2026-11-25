import type { ReactNode } from "react";
import type { Metadata } from "next";

import { footerLabelsFor } from "@/components/layout/site-footer-labels";
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
  const footerLabels = footerLabelsFor(locale, openApplications);

  return (
    <>
      <SiteNavbar
        locale={locale}
        labels={navLabelsFor(locale, openApplications)}
      />
      <div className="flex flex-1 flex-col scheme-light">{children}</div>
      <SiteFooter labels={footerLabels} />
    </>
  );
}
