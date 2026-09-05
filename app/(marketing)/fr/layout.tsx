import type { ReactNode } from "react";

import { ApplicationStatusBanner } from "@/components/layout/application-status-banner";
import { frFooterLabels } from "@/components/layout/site-footer-labels";
import { SiteFooter } from "@/components/layout/site-footer";
import { frNavLabels } from "@/components/layout/site-nav-labels";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { getOpenApplications } from "@/data/settings";

export default async function FrMarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const openApplications = await getOpenApplications();

  return (
    <>
      <SiteNavbar locale="fr" labels={frNavLabels(openApplications)} />
      <ApplicationStatusBanner
        locale="fr"
        openApplications={openApplications}
      />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter labels={frFooterLabels(openApplications)} />
    </>
  );
}
