import type { ReactNode } from "react";

import { frNavLabels } from "@/components/layout/site-nav-labels";
import { SiteNavbar } from "@/components/layout/site-navbar";

export default function FrMarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <SiteNavbar locale="fr" labels={frNavLabels()} />
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}
