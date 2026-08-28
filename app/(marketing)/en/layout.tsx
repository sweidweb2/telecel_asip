import type { ReactNode } from "react";

import { enFooterLabels } from "@/components/layout/site-footer-labels";
import { SiteFooter } from "@/components/layout/site-footer";
import { enNavLabels } from "@/components/layout/site-nav-labels";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { getActiveStartupFoundedYears } from "@/data/startups";

export default async function EnMarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const startupYears = await getActiveStartupFoundedYears();

  return (
    <>
      <SiteNavbar
        locale="en"
        labels={enNavLabels()}
        startupYears={startupYears}
      />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter labels={enFooterLabels()} />
    </>
  );
}
