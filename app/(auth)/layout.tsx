import type { ReactNode } from "react";

import { SiteNavbar } from "@/components/layout/site-navbar";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <SiteNavbar />
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}
