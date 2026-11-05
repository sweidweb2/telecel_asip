import { HomeCohortFilmPlayer } from "@/components/marketing/home-cohort-film-player";
import { cn } from "@/lib/utils";
import type { HomePageCopy } from "@/types/marketing-page";

type HomeCohortFilmSectionProps = {
  copy: HomePageCopy["cohortFilm"];
  className?: string;
};

/** ASIP spectrum — same order as the hero and next-chapter bars. */
const SPECTRUM = [
  "bg-brand",
  "bg-asip-mint",
  "bg-asip-magenta",
  "bg-asip-coral",
] as const;

/**
 * Home Module 02 — Cohort 3 film.
 * Cinema-first layout under the hero. Video bytes stay off the critical
 * path until the visitor presses play.
 */
export function HomeCohortFilmSection({
  copy,
  className,
}: HomeCohortFilmSectionProps) {
  const headingId = "home-cohort-film-heading";

  return (
    <section
      id="cohort-film"
      aria-labelledby={headingId}
      className={cn(
        "relative scroll-mt-24 overflow-hidden bg-brand-subtle",
        "px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,.55)_0%,transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl">
        <header className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span
              aria-hidden
              className="flex h-1 w-14 shrink-0 gap-0.5 overflow-hidden rounded-full sm:w-16"
            >
              {SPECTRUM.map((color) => (
                <span key={color} className={cn("h-full flex-1", color)} />
              ))}
            </span>
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-strong uppercase">
              {copy.eyebrow}
            </p>
            <span
              aria-hidden
              className="flex h-1 w-14 shrink-0 gap-0.5 overflow-hidden rounded-full sm:w-16"
            >
              {[...SPECTRUM].reverse().map((color) => (
                <span key={color} className={cn("h-full flex-1", color)} />
              ))}
            </span>
          </div>
          <h2
            id={headingId}
            className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance text-asip-ink sm:text-4xl lg:text-[2.75rem] lg:leading-tight"
          >
            {copy.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {copy.description}
          </p>
        </header>

        <div className="group/film relative mx-auto mt-8 sm:mt-10 lg:mt-12">
          <div
            aria-hidden
            className="absolute -inset-x-3 -inset-y-3 -z-10 rounded-[1.5rem] bg-asip-ink/10 blur-2xl sm:-inset-x-5 sm:-inset-y-4"
          />
          <div className="overflow-hidden rounded-xl shadow-[0_24px_60px_-28px_color-mix(in_srgb,var(--asip-ink)_45%,transparent)] sm:rounded-2xl">
            <div className="flex h-1.5 w-full" aria-hidden>
              {SPECTRUM.map((color) => (
                <span key={color} className={cn("h-full flex-1", color)} />
              ))}
            </div>
            <HomeCohortFilmPlayer
              playLabel={copy.playLabel}
              watchLabel={copy.watchLabel}
              eyebrow={copy.eyebrow}
              posterAlt={copy.posterAlt}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
