"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { cn } from "@/lib/utils";

type HttpStatusActionsProps = {
  locale?: Locale;
  tryAgainLabel: string;
  goHomeLabel: string;
  /** Prefer a hard navigation home when the document shell may be broken. */
  homeAsAnchor?: boolean;
  digest?: string | null;
};

export function HttpStatusActions({
  locale = "en",
  tryAgainLabel,
  goHomeLabel,
  homeAsAnchor = false,
  digest,
}: HttpStatusActionsProps) {
  const homeHref = publicPath(locale, "");

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
          window.location.assign(homeHref);
        }}
      >
        {tryAgainLabel}
      </Button>
      {homeAsAnchor ? (
        <a
          href={homeHref}
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          {goHomeLabel}
        </a>
      ) : (
        <Link
          href={homeHref}
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          {goHomeLabel}
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
