import {
  AfricaInnovationBlueprint,
  type BlueprintTone,
} from "@/components/marketing/africa-innovation-blueprint";
import { labAfricaBlueprintCopyFor } from "@/constants/lab-africa-blueprint-copy";
import type { Locale } from "@/constants/locales";
import { cn } from "@/lib/utils";

type LabAfricaBlueprintSectionProps = {
  locale: Locale;
  tone?: BlueprintTone;
  className?: string;
};

/**
 * Lab playground — technical blueprint hero: Africa outline schematic
 * with ecosystem nodes, CAD annotations, and clean typography space.
 */
export function LabAfricaBlueprintSection({
  locale,
  tone = "dark",
  className,
}: LabAfricaBlueprintSectionProps) {
  const copy = labAfricaBlueprintCopyFor(locale);
  const isLight = tone === "light";
  const headingId = isLight
    ? "lab-africa-blueprint-light-heading"
    : "lab-africa-blueprint-heading";

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "relative overflow-hidden border-t border-border",
        isLight ? "bg-[#f4f7f5]" : "bg-[#0b1c22]",
        className,
      )}
    >
      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-12 lg:items-center lg:gap-8 lg:px-8 lg:py-20">
        <div className="relative z-10 max-w-xl lg:col-span-5 lg:max-w-none">
          <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-[#179191] uppercase">
            {copy.eyebrow}
            {isLight ? " · Light" : ""}
          </p>
          <h2
            id={headingId}
            className={cn(
              "mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]",
              isLight ? "text-[#14333b]" : "text-[#e8f4f2]",
            )}
          >
            {copy.title}
          </h2>
          <p
            className={cn(
              "mt-4 max-w-md text-base leading-7 sm:mt-5 sm:text-lg sm:leading-8",
              isLight ? "text-[#5a7a80]" : "text-[#9ec9c5]/90",
            )}
          >
            {copy.description}
          </p>

          <dl
            className={cn(
              "mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t pt-6 text-[0.65rem] tracking-[0.16em] uppercase",
              isLight
                ? "border-[#14333b]/12 text-[#5a7a80]"
                : "border-[#7eb8b4]/20 text-[#7eb8b4]",
            )}
          >
            <div>
              <dt className="opacity-60">Ref</dt>
              <dd
                className={cn(
                  "mt-1",
                  isLight ? "text-[#14333b]" : "text-[#c5e4e0]",
                )}
              >
                {copy.drawingId}
              </dd>
            </div>
            <div>
              <dt className="opacity-60">Sheet</dt>
              <dd
                className={cn(
                  "mt-1",
                  isLight ? "text-[#14333b]" : "text-[#c5e4e0]",
                )}
              >
                01 / 01
              </dd>
            </div>
            <div>
              <dt className="opacity-60">Status</dt>
              <dd className="mt-1 text-[#179191]">Active</dd>
            </div>
          </dl>
        </div>

        <div className="relative lg:col-span-7">
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute -inset-6 rounded-[2rem]",
              isLight
                ? "bg-[radial-gradient(ellipse_at_center,rgba(23,145,145,0.1),transparent_62%)]"
                : "bg-[radial-gradient(ellipse_at_center,rgba(23,145,145,0.14),transparent_62%)]",
            )}
          />
          <AfricaInnovationBlueprint
            tone={tone}
            titleBlock={copy.titleBlock}
            className={cn(
              "relative h-auto w-full overflow-hidden rounded-sm",
              isLight
                ? "shadow-[0_0_0_1px_rgba(20,51,59,0.1)]"
                : "shadow-[0_0_0_1px_rgba(126,184,180,0.12)]",
            )}
          />
        </div>
      </div>
    </section>
  );
}
