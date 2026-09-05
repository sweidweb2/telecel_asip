import type { ReactNode } from "react";

import { ApplicationStatusBanner } from "@/components/layout/application-status-banner";
import { enFooterLabels } from "@/components/layout/site-footer-labels";
import { SiteFooter } from "@/components/layout/site-footer";
import { enNavLabels } from "@/components/layout/site-nav-labels";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { getOpenApplications } from "@/data/settings";

export default async function EnMarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const openApplications = await getOpenApplications();

  return (
    <>
      <SiteNavbar locale="en" labels={enNavLabels(openApplications)} />
      <ApplicationStatusBanner
        locale="en"
        openApplications={openApplications}
      />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter labels={enFooterLabels(openApplications)} />
    </>
  );
}
