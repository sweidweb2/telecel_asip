import {
  Briefcase,
  ChartNoAxesColumn,
  Eye,
  Handshake,
  Infinity,
  Network,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  ProgrammePageCopy,
  ProgrammeValueId,
} from "@/types/marketing-page";

const VALUE_ICONS: Record<ProgrammeValueId, LucideIcon> = {
  expertise: Briefcase,
  network: Network,
  intelligence: ChartNoAxesColumn,
  investment: TrendingUp,
  commercial: Handshake,
  visibility: Eye,
  continuity: Infinity,
};

type ProgrammeValueSectionProps = {
  copy: ProgrammePageCopy["value"];
};

/**
 * Programme “What founders gain” — scannable benefit grid (not a sequence).
 * 1 col mobile → 2 / 3 desktop; final item centered so 7 never orphans.
 */
export function ProgrammeValueSection({ copy }: ProgrammeValueSectionProps) {
  const lastIndex = copy.items.length - 1;

  return (
    <section
      id="value"
      aria-labelledby="programme-value-heading"
      className="scroll-mt-24 border-b border-border bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <h2
          id="programme-value-heading"
          className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
        >
          {copy.title}
        </h2>

        <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:mt-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
          {copy.items.map((item, index) => {
            const Icon = VALUE_ICONS[item.id];
            const isLast = index === lastIndex;

            return (
              <li
                key={item.id}
                className={cn(
                  "min-w-0",
                  isLast &&
                    "sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-sm lg:col-span-1 lg:col-start-2 lg:mx-0 lg:max-w-none",
                )}
              >
                <article className="group flex h-full flex-col gap-3 outline-none focus-visible:outline-none">
                  <Icon
                    className="size-5 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-[#dc395f] group-focus-within:text-[#dc395f] sm:size-[1.35rem]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-base font-semibold tracking-tight text-[#14333b] transition-colors duration-200 group-hover:text-[#dc395f] group-focus-within:text-[#dc395f] sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground sm:text-[0.9375rem] sm:leading-7">
                      {item.description}
                    </p>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
