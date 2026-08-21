import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export type MarketingCta = {
  href: string;
  label: string;
  variant?: "default" | "outline" | "ghost";
};

type MarketingPageShellProps = {
  title: string;
  description: string;
  /** Optional note under body (e.g. Telecel content pending). */
  note?: string;
  ctas?: MarketingCta[];
  children?: ReactNode;
};

export function MarketingPageShell({
  title,
  description,
  note,
  ctas,
  children,
}: MarketingPageShellProps) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-16">
      <div className="max-w-2xl space-y-6">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground">{description}</p>
        {note ? (
          <p className="text-sm text-muted-foreground/80 italic">{note}</p>
        ) : null}
        {ctas && ctas.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {ctas.map((cta) => (
              <Button
                key={`${cta.href}-${cta.label}`}
                variant={cta.variant ?? "default"}
                asChild
              >
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            ))}
          </div>
        ) : null}
        {children}
      </div>
    </main>
  );
}
