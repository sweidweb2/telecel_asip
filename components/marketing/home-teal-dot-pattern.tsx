import { cn } from "@/lib/utils";

/** Soft white dots on dark teal — shared by platform + dark cutaways. */
export const HOME_TEAL_DOT_PATTERN_STYLE = {
  backgroundImage:
    "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1.2px)",
  backgroundSize: "18px 18px",
};

/** Soft ink dots for light cutaways (impact years light mode). */
export const HOME_LIGHT_DOT_PATTERN_STYLE = {
  backgroundImage:
    "radial-gradient(circle, color-mix(in_srgb, var(--asip-ink) 28%, transparent) 1px, transparent 1.2px)",
  backgroundSize: "18px 18px",
};

type HomeTealDotPatternProps = {
  className?: string;
  /** Soft center vignette (platform body only — skip on the cutaway triangle). */
  withVignette?: boolean;
  /** Dark = white dots on teal; light = ink dots on cream/paper. */
  tone?: "dark" | "light";
};

/**
 * Atmosphere layer for teal or light cutaway surfaces. Same tile rhythm so
 * diagonal joins read as one continuous plane.
 */
export function HomeTealDotPattern({
  className,
  withVignette = false,
  tone = "dark",
}: HomeTealDotPatternProps) {
  const isLight = tone === "light";

  return (
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          isLight ? "opacity-[0.55]" : "opacity-[0.11]",
          className,
        )}
        style={isLight ? HOME_LIGHT_DOT_PATTERN_STYLE : HOME_TEAL_DOT_PATTERN_STYLE}
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
