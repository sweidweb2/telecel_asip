import type { ReactNode } from "react";

import { enNavLabels } from "@/components/layout/site-nav-labels";
import { SiteNavbar } from "@/components/layout/site-navbar";

export default function EnMarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <SiteNavbar locale="en" labels={enNavLabels()} />
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}
