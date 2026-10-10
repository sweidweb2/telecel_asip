import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminPortalLinkItem = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

/** Outline shortcut tile used on the editor and admin overview pages. */
export function AdminPortalLinkList({
  items,
}: {
  items: readonly AdminPortalLinkItem[];
}) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-auto min-h-11 w-full items-start justify-start gap-3 px-4 py-4 whitespace-normal",
              )}
            >
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-foreground">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 text-left">
                <span className="block font-medium text-foreground">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-sm font-normal text-muted-foreground text-pretty">
                  {item.description}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
