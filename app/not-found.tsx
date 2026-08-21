import type { Metadata } from "next";
import Link from "next/link";
import { FileQuestionIcon } from "lucide-react";

import { ErrorScreen } from "@/components/layout/error-screen";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <>
      <SiteNavbar />
      <div className="flex flex-1 flex-col">
        <ErrorScreen
          icon={FileQuestionIcon}
          code="404"
          title="Page not found"
          description="This page does not exist or was moved. Check the URL, or go back home."
        >
          <Button className="w-full" asChild>
            <Link href={ROUTES.home}>Go home</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href={ROUTES.dashboard}>Dashboard</Link>
          </Button>
        </ErrorScreen>
      </div>
    </>
  );
}
