import type { Metadata } from "next";
import Link from "next/link";
import { FileQuestionIcon } from "lucide-react";

import { enFooterLabels } from "@/components/layout/site-footer-labels";
import { SiteFooter } from "@/components/layout/site-footer";
import { enNavLabels } from "@/components/layout/site-nav-labels";
import { ErrorScreen } from "@/components/layout/error-screen";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { buttonVariants } from "@/components/ui/button";
import { publicPath, ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <>
      <SiteNavbar locale="en" labels={enNavLabels()} />
      <div className="flex flex-1 flex-col">
        <ErrorScreen
          icon={FileQuestionIcon}
          code="404"
          title="Page not found"
          description="This page does not exist or was moved. Check the URL, or go back home."
        >
          <Link
            href={publicPath("en")}
            className={cn(buttonVariants(), "w-full")}
          >
            Go home
          </Link>
          <Link
            href={ROUTES.login}
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            Login
          </Link>
        </ErrorScreen>
      </div>
      <SiteFooter labels={enFooterLabels()} />
    </>
  );
}
