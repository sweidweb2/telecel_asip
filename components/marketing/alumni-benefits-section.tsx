import {
  Eye,
  Handshake,
  Lightbulb,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import { HomeTealDotPattern } from "@/components/marketing/home-teal-dot-pattern";
import { cn } from "@/lib/utils";
import type {
  AlumniBenefitId,
  AlumniPageCopy,
} from "@/types/marketing-page";

const BENEFIT_ICONS: Record<AlumniBenefitId, LucideIcon> = {
  community: Users,
  learning: Lightbulb,
  opportunities: Sparkles,
  visibility: Eye,
  "give-back": Handshake,
};

type AlumniBenefitsSectionProps = {
  copy: AlumniPageCopy["benefits"];
  className?: string;
};

/**
 * Alumni benefits — scannable grid on the same ink + teal-dot surface as
 * Programme value. Five items: three on the first row, two centered beneath.
 */
export function AlumniBenefitsSection({
  copy,
  className,
}: AlumniBenefitsSectionProps) {
  const itemCount = copy.items.length;

  return (
    <section
      id="benefits"
      aria-labelledby="alumni-benefits-heading"
      className={cn(
        "relative scroll-mt-24 overflow-hidden border-b border-white/10 bg-[#14333b] text-white",
        className,
      )}
    >
      <HomeTealDotPattern withVignette />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <h2
          id="alumni-benefits-heading"
          className="max-w-2xl font-heading text-2xl font-semibold tracking-tight text-balance text-white sm:text-3xl"
        >
          {copy.title}
        </h2>

        <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:mt-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-6 lg:gap-x-8 lg:gap-y-12">
          {copy.items.map((item, index) => {
            const Icon = BENEFIT_ICONS[item.id];
            const isSecondRowPair =
              itemCount === 5 && (index === 3 || index === 4);

            return (
              <li
                key={item.id}
                className={cn(
                  "min-w-0 lg:col-span-2",
                  isSecondRowPair && index === 3 && "lg:col-start-2",
                  isSecondRowPair && index === 4 && "lg:col-start-4",
                )}
              >
                <article className="group flex h-full flex-col gap-3 outline-none focus-visible:outline-none">
                  <Icon
                    className="size-5 shrink-0 text-white/65 transition-colors duration-200 group-hover:text-[#9ad1bf] group-focus-within:text-[#9ad1bf] sm:size-[1.35rem]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-base font-semibold tracking-tight text-white transition-colors duration-200 group-hover:text-[#9ad1bf] group-focus-within:text-[#9ad1bf] sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-white/70 sm:text-[0.9375rem] sm:leading-7">
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
