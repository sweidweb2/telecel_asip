"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CircleAlertIcon } from "lucide-react";

import { ErrorScreen } from "@/components/layout/error-screen";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export type RouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  homeAsAnchor?: boolean;
};

export function RouteError({
  error,
  reset,
  homeAsAnchor = false,
}: RouteErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      icon={CircleAlertIcon}
      code="Error"
      title="Something went wrong"
      description="An unexpected error occurred. You can try again, or go back home."
      tone="destructive"
    >
      <Button type="button" className="w-full" onClick={reset}>
        Try again
      </Button>
      <Button variant="outline" className="w-full" asChild>
        {homeAsAnchor ? (
          <a href={ROUTES.home}>Go home</a>
        ) : (
          <Link href={ROUTES.home}>Go home</Link>
        )}
      </Button>
      {error.digest ? (
        <p className="pt-1 text-center text-xs text-muted-foreground">
          Reference {error.digest}
        </p>
      ) : null}
    </ErrorScreen>
  );
}
