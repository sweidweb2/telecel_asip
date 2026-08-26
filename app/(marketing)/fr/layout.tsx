import type { ReactNode } from "react";

import { frFooterLabels } from "@/components/layout/site-footer-labels";
import { SiteFooter } from "@/components/layout/site-footer";
import { frNavLabels } from "@/components/layout/site-nav-labels";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { isAuthenticated } from "@/data/auth";
import { getActiveStartupFoundedYears } from "@/data/startups";

export default async function FrMarketingLayout({
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
        locale="fr"
        labels={frNavLabels()}
        isAuthenticated={loggedIn}
        startupYears={startupYears}
      />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter labels={frFooterLabels()} />
    </>
  );
}
