import { cn } from "@/lib/utils";

/** Soft white dots on dark teal — shared by platform + impact cutaway. */
export const HOME_TEAL_DOT_PATTERN_STYLE = {
  backgroundImage:
    "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1.2px)",
  backgroundSize: "18px 18px",
};

type HomeTealDotPatternProps = {
  className?: string;
  /** Soft center vignette (platform body only — skip on the cutaway triangle). */
  withVignette?: boolean;
};

/**
 * Atmosphere layer for `#14333b` surfaces. Same tile on the impact cutaway
 * and platform section so the diagonal join reads as one continuous plane.
 */
export function HomeTealDotPattern({
  className,
  withVignette = false,
}: HomeTealDotPatternProps) {
  return (
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 opacity-[0.11]",
          className,
        )}
        style={HOME_TEAL_DOT_PATTERN_STYLE}
      />
      {withVignette ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,transparent_0%,color-mix(in_srgb,var(--asip-ink)_55%,transparent)_70%)]"
        />
      ) : null}
    </>
  );
}
