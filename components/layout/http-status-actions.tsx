"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type HttpStatusActionsProps = {
  /** Prefer a hard navigation home when the document shell may be broken. */
  homeAsAnchor?: boolean;
  digest?: string | null;
};

export function HttpStatusActions({
  homeAsAnchor = false,
  digest,
}: HttpStatusActionsProps) {
  return (
    <>
      <Button
        type="button"
        className="w-full"
        onClick={() => {
          if (typeof window === "undefined") return;
          if (window.history.length > 1) {
            window.history.back();
            return;
          }
          window.location.assign(ROUTES.home);
        }}
      >
        Try again
      </Button>
      {homeAsAnchor ? (
        <a
          href={ROUTES.home}
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Go home
        </a>
      ) : (
        <Link
          href={ROUTES.home}
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Go home
        </Link>
      )}
      {digest ? (
        <p className="pt-1 text-center text-xs text-muted-foreground">
          Reference {digest}
        </p>
      ) : null}
    </>
  );
}
