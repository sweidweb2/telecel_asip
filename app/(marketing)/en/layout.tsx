import type { ReactNode } from "react";

import { enFooterLabels } from "@/components/layout/site-footer-labels";
import { SiteFooter } from "@/components/layout/site-footer";
import { enNavLabels } from "@/components/layout/site-nav-labels";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { getOpenApplications } from "@/data/settings";
import { getActiveStartupFoundedYears } from "@/data/startups";

export default async function EnMarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [startupYears, openApplications] = await Promise.all([
    getActiveStartupFoundedYears(),
    getOpenApplications(),
  ]);

  return (
    <>
      <SiteNavbar
        locale="en"
        labels={enNavLabels(openApplications)}
        startupYears={startupYears}
      />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter labels={enFooterLabels()} />
    </>
  );
}
