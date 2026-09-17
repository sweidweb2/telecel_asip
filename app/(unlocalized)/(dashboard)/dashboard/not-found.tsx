import type { Metadata } from "next";
import Link from "next/link";
import { FileQuestionIcon } from "lucide-react";

import { ErrorScreen } from "@/components/layout/error-screen";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Page not found | ASIP Editor",
};

/**
 * Nested not-found for `/dashboard/*` — keeps the editor shell (layout above)
 * and avoids the marketing 404 chrome.
 */
export default function DashboardNotFound() {
  return (
    <ErrorScreen
      icon={FileQuestionIcon}
      code="404"
      title="Page not found"
      description="This editor page does not exist or was moved. Check the URL, or go back to the dashboard."
    >
      <Link
        href={ROUTES.dashboard}
        className={cn(buttonVariants(), "w-full")}
      >
        Back to dashboard
      </Link>
    </ErrorScreen>
  );
}
