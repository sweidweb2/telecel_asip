import { cn } from "@/lib/utils";

type QuoteTone = "mint" | "sun" | "blush" | "ink";

const TONES: Record<QuoteTone, { card: string; mark: string; meta: string }> = {
  mint: { card: "bg-asip-mint/55 text-asip-ink", mark: "text-brand-strong", meta: "text-asip-ink/75" },
  sun: { card: "bg-asip-sun/75 text-asip-ink", mark: "text-asip-coral", meta: "text-asip-ink/75" },
  blush: { card: "bg-asip-blush/75 text-asip-ink", mark: "text-asip-magenta", meta: "text-asip-ink/75" },
  ink: { card: "bg-asip-ink text-white", mark: "text-asip-sun", meta: "text-white/75" },
};

/**
 * Founder pull quote, sized to read well as a screenshot (refresh phase 2).
 * Only for quotes that already exist in approved copy or CMS stories.
 */
export function QuoteCard({
  quote,
  name,
  role,
  tone = "mint",
  className,
}: {
  quote: string;
  name: string;
  /** e.g. "Founder, Rural Farmers Hub". */
  role?: string;
  tone?: QuoteTone;
  className?: string;
}) {
  const t = TONES[tone];

  return (
    <figure
      className={cn(
        "relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-3xl p-7 sm:p-8",
        t.card,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-6 left-4 font-heading text-[8rem] leading-none font-bold select-none",
          t.mark,
        )}
      >
        “
      </span>
      <blockquote className="relative pt-10 font-heading text-xl leading-snug font-semibold tracking-[-0.02em] text-balance sm:text-2xl">
        {quote}
      </blockquote>
      <figcaption className="relative">
        <span className="block font-semibold">{name}</span>
        {role ? <span className={cn("block text-sm", t.meta)}>{role}</span> : null}
      </figcaption>
    </figure>
  );
}
