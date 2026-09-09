import {
  Eye,
  Handshake,
  Lightbulb,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

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
 * Side-only atmosphere on global beige — color lives left/right so top and
 * bottom stay open to the neighboring beige sections. No hero geometry.
 */
function AlumniBenefitsField() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-background" />

      {/* Continuous side washes avoid visible rectangular gradient edges. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 38% 82% at -6% 50%, rgb(154 209 191 / 0.42) 0%, rgb(220 233 223 / 0.24) 46%, transparent 100%),
            radial-gradient(ellipse 36% 80% at 106% 50%, rgb(23 145 145 / 0.18) 0%, rgb(227 238 230 / 0.2) 48%, transparent 100%)
          `,
        }}
      />

      {/* Side-weighted teal grain — fades hard at top/bottom */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.45,
          backgroundImage:
            "radial-gradient(rgb(23 145 145 / 0.2) 1.15px, transparent 1.25px)",
          backgroundSize: "18px 18px",
          WebkitMaskImage: `
            linear-gradient(90deg, black 0%, transparent 28%, transparent 72%, black 100%),
            linear-gradient(180deg, transparent 0%, black 26%, black 74%, transparent 100%)
          `,
          maskImage: `
            linear-gradient(90deg, black 0%, transparent 28%, transparent 72%, black 100%),
            linear-gradient(180deg, transparent 0%, black 26%, black 74%, transparent 100%)
          `,
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }}
      />
    </div>
  );
}

/**
 * Alumni benefits — beige continuum with purpose / CTA; color on the sides.
 * Five items: three on the first row, two centered beneath.
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
        "relative scroll-mt-24 overflow-hidden bg-background text-foreground",
        className,
      )}
    >
      <AlumniBenefitsField />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <span
          className="mb-4 block h-0.5 w-10 bg-asip-coral sm:mb-5"
          aria-hidden
        />
        <h2
          id="alumni-benefits-heading"
          className="max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl"
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
                    className="size-5 shrink-0 text-primary/70 transition-colors duration-200 group-hover:text-primary group-focus-within:text-primary sm:size-[1.35rem]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-base font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary group-focus-within:text-primary sm:text-lg">
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
