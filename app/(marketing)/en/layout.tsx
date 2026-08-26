import type { ReactNode } from "react";

import { enFooterLabels } from "@/components/layout/site-footer-labels";
import { SiteFooter } from "@/components/layout/site-footer";
import { enNavLabels } from "@/components/layout/site-nav-labels";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { isAuthenticated } from "@/data/auth";
import { getActiveStartupFoundedYears } from "@/data/startups";

export default async function EnMarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [loggedIn, startupYears] = await Promise.all([
    isAuthenticated(),
    getActiveStartupFoundedYears(),
  ]);

  return (
    <>
      <SiteNavbar
        locale="en"
        labels={enNavLabels()}
        isAuthenticated={loggedIn}
        startupYears={startupYears}
      />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter labels={enFooterLabels()} />
    </>
  );
}
