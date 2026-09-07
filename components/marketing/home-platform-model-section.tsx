import { HomePlatformModelInteractive } from "@/components/marketing/home-platform-model-interactive";
import { HomeTealDotPattern } from "@/components/marketing/home-teal-dot-pattern";
import { cn } from "@/lib/utils";
import type { HomePageCopy } from "@/types/marketing-page";

type HomePlatformModelSectionProps = {
  copy: HomePageCopy["platform"];
  className?: string;
};

/**
 * Home Module 03 — Platform model (RSC chrome + client spinner/carousel).
 */
export function HomePlatformModelSection({
  copy,
  className,
}: HomePlatformModelSectionProps) {
  return (
    <section
      id="platform-model"
      aria-labelledby="home-platform-model-heading"
      className={cn(
        "relative overflow-hidden border-b border-white/10 bg-[#14333b] text-white",
        "px-4 pt-0 pb-12 sm:px-6 sm:pt-0 sm:pb-16 lg:px-8 lg:pt-0 lg:pb-20",
        className,
      )}
    >
      <HomeTealDotPattern withVignette />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 sm:gap-10">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#9ad1bf] uppercase">
            Platform
          </p>
          <h2
            id="home-platform-model-heading"
            className="mt-2 font-heading text-xl font-semibold tracking-tight text-balance text-white sm:text-2xl lg:text-3xl"
          >
            {copy.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
            {copy.description}
          </p>
        </header>

        <HomePlatformModelInteractive steps={copy.steps} />
      </div>
    </section>
  );
}
