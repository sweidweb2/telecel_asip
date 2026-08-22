import type { Metadata } from "next";
import Link from "next/link";
import { FileQuestionIcon } from "lucide-react";

import { enFooterLabels } from "@/components/layout/site-footer-labels";
import { SiteFooter } from "@/components/layout/site-footer";
import { enNavLabels } from "@/components/layout/site-nav-labels";
import { ErrorScreen } from "@/components/layout/error-screen";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { Button } from "@/components/ui/button";
import { publicPath, ROUTES } from "@/constants/routes";
import { isAuthenticated } from "@/data/auth";

export const metadata: Metadata = {
  title: "Page not found",
};

export default async function NotFound() {
  const loggedIn = await isAuthenticated();

  return (
    <>
      <SiteNavbar
        locale="en"
        labels={enNavLabels()}
        isAuthenticated={loggedIn}
      />
      <div className="flex flex-1 flex-col">
        <ErrorScreen
          icon={FileQuestionIcon}
          code="404"
          title="Page not found"
          description="This page does not exist or was moved. Check the URL, or go back home."
        >
          <Button className="w-full" asChild>
            <Link href={publicPath("en")}>Go home</Link>
          </Button>
          {loggedIn ? (
            <Button variant="outline" className="w-full" asChild>
              <Link href={ROUTES.dashboard}>Dashboard</Link>
            </Button>
          ) : (
            <Button variant="outline" className="w-full" asChild>
              <Link href={ROUTES.login}>Login</Link>
            </Button>
          )}
        </ErrorScreen>
      </div>
      <SiteFooter labels={enFooterLabels()} />
    </>
  );
}
