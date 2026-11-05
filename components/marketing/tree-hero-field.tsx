/**
 * Shared fractal-tree field used by Programme (light) and Founders (primary) heroes.
 */

export type TreeLayer = { id: number; d: string; strokeWidth: number };

export type FractalTreeModel = {
  width: number;
  height: number;
  viewBox: string;
  layers: TreeLayer[];
};

function round(n: number) {
  return Math.round(n * 10) / 10;
}

/**
 * Wireframe fractal tree as SVG path layers (thicker trunk, finer tips).
 * Built once at module load — same output on server and client.
 */
export function buildFractalTree({
  depth,
  length,
  width,
  height,
  leftSpread = 31,
  rightSpread = 25,
  shrink = 0.7,
  trunkLength,
  limbAngles,
  forkY,
}: {
  depth: number;
  length: number;
  width: number;
  height: number;
  leftSpread?: number;
  rightSpread?: number;
  shrink?: number;
  /** Short stem at the base. When set, `length` is the first canopy limbs. */
  trunkLength?: number;
  limbAngles?: number[];
  /** 0–1. Where the main limbs start; trunk below this is omitted. */
  forkY?: number;
}): FractalTreeModel {
  const originX = width / 2;
  const originY = height - 2;
  const layers = new Map<number, string[]>();

  function walk(
    x: number,
    y: number,
    angleDeg: number,
    branchLength: number,
    remaining: number,
  ) {
    if (remaining === 0 || branchLength < 1.4) return;
    const rad = (angleDeg * Math.PI) / 180;
    const x2 = x + Math.cos(rad) * branchLength;
    const y2 = y - Math.sin(rad) * branchLength;
    const segs = layers.get(remaining) ?? [];
    segs.push(
      `M${round(x)} ${round(y)}L${round(x2)} ${round(y2)}`,
    );
    layers.set(remaining, segs);
    walk(x2, y2, angleDeg + leftSpread, branchLength * shrink, remaining - 1);
    walk(
      x2,
      y2,
      angleDeg - rightSpread,
      branchLength * (shrink - 0.02),
      remaining - 1,
    );
  }

  const forkPointY =
    forkY != null ? height * forkY : originY - (trunkLength ?? 0);

  if (limbAngles && limbAngles.length > 0) {
    const angles = limbAngles;
    for (const angle of angles) {
      const isOuter = angle < 60 || angle > 120;
      walk(originX, forkPointY, angle, length * (isOuter ? 1.12 : 1), depth);
    }
  } else if (trunkLength && trunkLength > 0) {
    const trunkTopY = originY - trunkLength;
    const trunkSegs = layers.get(depth) ?? [];
    trunkSegs.push(
      `M${round(originX)} ${round(originY)}L${round(originX)} ${round(trunkTopY)}`,
    );
    layers.set(depth, trunkSegs);

    const angles = [58, 90, 122];
    for (const angle of angles) {
      const limbScale = angle === 90 ? 1.08 : 1;
      walk(originX, trunkTopY, angle, length * limbScale, depth - 1);
    }
  } else {
    walk(originX, originY, 90, length, depth);
  }

  return {
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    layers: [...layers.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([remaining, segs]) => ({
        id: remaining,
        d: segs.join(""),
        strokeWidth:
          remaining >= 8 ? 1.15 + remaining * 0.2 : 0.4 + remaining * 0.22,
      })),
  };
}

export const PATTERN_TREE = buildFractalTree({
  depth: 4,
  length: 58,
  width: 140,
  height: 190,
});

export const FEATURE_TREE = buildFractalTree({
  depth: 10,
  length: 130,
  width: 1200,
  height: 640,
  forkY: 1,
  limbAngles: [40, 68, 112, 140],
  leftSpread: 34,
  rightSpread: 28,
  shrink: 0.72,
});

export function TreeGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 20"
      className={className}
      fill="none"
      aria-hidden
    >
      <path
        d="M8 18.5V11.5M8 11.5 4.2 7.2M8 11.5l3.8-4.3M4.2 7.2 2.4 4.1M4.2 7.2 5.8 3.8M11.8 7.2 10.2 3.8M11.8 7.2 13.6 4.1"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FractalTree({
  tree,
  className,
  strokeClassName,
  preserveAspectRatio = "xMidYMax meet",
}: {
  tree: FractalTreeModel;
  className?: string;
  strokeClassName?: string;
  preserveAspectRatio?: string;
}) {
  return (
    <svg
      viewBox={tree.viewBox}
      preserveAspectRatio={preserveAspectRatio}
      className={className}
      fill="none"
      aria-hidden
    >
      {tree.layers.map((layer) => (
        <path
          key={layer.id}
          d={layer.d}
          className={strokeClassName}
          strokeWidth={layer.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

export type TreeHeroTone = "light" | "primary";

type TreeHeroFieldProps = {
  tone: TreeHeroTone;
  /** Unique SVG pattern id (required when multiple heroes mount on one page). */
  patternId: string;
};

/**
 * Absolute decorative field — light programme surface or primary ink.
 */
export function TreeHeroField({ tone, patternId }: TreeHeroFieldProps) {
  const isPrimary = tone === "primary";

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <svg
        className={
          isPrimary
            ? "absolute inset-0 h-full w-full text-asip-mint opacity-[0.07]"
            : "absolute inset-0 h-full w-full text-primary opacity-[0.04]"
        }
      >
        <defs>
          <pattern
            id={patternId}
            width={PATTERN_TREE.width}
            height={PATTERN_TREE.height}
            patternUnits="userSpaceOnUse"
          >
            {PATTERN_TREE.layers.map((layer) => (
              <path
                key={layer.id}
                d={layer.d}
                fill="none"
                stroke="currentColor"
                strokeWidth={layer.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      <div className="absolute inset-0 overflow-hidden">
        <FractalTree
          tree={FEATURE_TREE}
          preserveAspectRatio="xMidYMax slice"
          className={
            isPrimary
              ? "absolute bottom-0 left-0 h-full w-full overflow-visible opacity-[0.14] sm:opacity-[0.16]"
              : "absolute bottom-0 left-0 h-full w-full overflow-visible opacity-[0.1] sm:opacity-[0.12]"
          }
          strokeClassName={isPrimary ? "stroke-asip-mint" : "stroke-primary"}
        />
      </div>

      {isPrimary ? (
        <>
          <div className="absolute left-1/2 top-[18%] size-[min(70vw,28rem)] -translate-x-1/2 rounded-full bg-brand/25 blur-3xl" />
          <div className="absolute -bottom-16 right-[12%] size-[min(55vw,22rem)] rounded-full bg-brand-mid/20 blur-3xl" />
          <div className="absolute bottom-[20%] left-[8%] size-[min(40vw,16rem)] rounded-full bg-asip-mint/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,color-mix(in_srgb,var(--asip-ink)_55%,transparent)_0%,transparent_68%)]" />
        </>
      ) : (
        <>
          <div className="absolute left-1/2 top-[18%] size-[min(70vw,28rem)] -translate-x-1/2 rounded-full bg-primary/18 blur-3xl" />
          <div className="absolute -bottom-16 right-[12%] size-[min(55vw,22rem)] rounded-full bg-brand-mid/20 blur-3xl" />
          <div className="absolute bottom-[20%] left-[8%] size-[min(40vw,16rem)] rounded-full bg-brand-soft/80 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,color-mix(in_oklch,var(--background)_42%,transparent)_0%,transparent_68%)]" />
        </>
      )}
    </div>
  );
}
