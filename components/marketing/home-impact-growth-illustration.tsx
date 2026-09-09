import { useId } from "react";

import { cn } from "@/lib/utils";

type HomeImpactGrowthIllustrationProps = {
  className?: string;
};

/** Uniform tread size — seamless escalator period. */
const STEP_W = 150;
const STEP_H = 88;
const STEP_DX = 90;
const STEP_DY = 60;
const CYCLE = 6;
const ORIGIN_X = 40;
const ORIGIN_Y = 312;

const STEP_FILLS = [
  "#e8f2f1",
  "#c5e0de",
  "#7bbbb8",
  "#179191",
  "#0f6e6e",
  "#14333b",
] as const;

const CYCLE_DX = CYCLE * STEP_DX;
const CYCLE_DY = CYCLE * STEP_DY;

const CORAL_PATH =
  "M56 398 V257 H178 V197 H268 V137 H358 V77 H443 V2 H528";
const CORAL_TIP = "M520 -6 L528 2 L520 10";
const YELLOW_PATH =
  "M74 398 V232 H192 V172 H282 V112 H372 V52 H457 V-10 H540";
const YELLOW_TIP = "M532 -18 L540 -10 L532 -2";

function StairSet() {
  return (
    <g>
      {STEP_FILLS.map((fill, i) => (
        <rect
          key={fill}
          x={ORIGIN_X + i * STEP_DX}
          y={ORIGIN_Y - i * STEP_DY}
          width={STEP_W}
          height={STEP_H}
          rx="5"
          fill={fill}
        />
      ))}
    </g>
  );
}

type RebornArrowProps = {
  pathD: string;
  tipD: string;
  stroke: string;
  strokeWidth: number;
  /** Base timing lane — each arrow has its own delay + a twin that replaces it. */
  lane: "coral" | "yellow";
};

/**
 * Draws bottom→tip, fades, then a delayed twin starts so one always
 * “reborns” as the previous finishes — infinite, independent of stairs.
 */
function RebornArrow({
  pathD,
  tipD,
  stroke,
  strokeWidth,
  lane,
}: RebornArrowProps) {
  const strokeClass = cn(
    "impact-arrow-stroke",
    lane === "coral" ? "impact-arrow-coral" : "impact-arrow-yellow",
  );
  const tipClass = cn(
    "impact-arrow-tip",
    lane === "coral" ? "impact-arrow-coral" : "impact-arrow-yellow",
  );
  const twinStrokeClass = cn(strokeClass, "impact-arrow-twin");
  const twinTipClass = cn(tipClass, "impact-arrow-twin");

  const shared = {
    stroke,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none" as const,
    pathLength: 1,
  };

  return (
    <g>
      <path d={pathD} className={strokeClass} {...shared} />
      <path d={tipD} className={tipClass} {...shared} />
      <path d={pathD} className={twinStrokeClass} {...shared} />
      <path d={tipD} className={twinTipClass} {...shared} />
    </g>
  );
}

/**
 * Decorative growth schematic — teal escalator stairs + independently
 * reborn progress arrows (each with its own delay).
 */
export function HomeImpactGrowthIllustration({
  className,
}: HomeImpactGrowthIllustrationProps) {
  const uid = useId().replace(/:/g, "");
  const clipId = `impact-stairs-clip-${uid}`;
  const maskId = `impact-stairs-mask-${uid}`;
  const fadeId = `impact-stairs-fade-${uid}`;

  return (
    <svg
      viewBox="0 0 560 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-auto w-full overflow-visible", className)}
      aria-hidden
      preserveAspectRatio="xMaxYMax meet"
    >
      <defs>
        <linearGradient
          id={fadeId}
          gradientUnits="userSpaceOnUse"
          x1={ORIGIN_X}
          y1={ORIGIN_Y + STEP_H}
          x2={ORIGIN_X + 5.2 * STEP_DX}
          y2={ORIGIN_Y - 5.2 * STEP_DY}
        >
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="14%" stopColor="#fff" stopOpacity="1" />
          <stop offset="86%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="560"
          height="400"
        >
          <rect width="560" height="400" fill={`url(#${fadeId})`} />
        </mask>
        <clipPath id={clipId}>
          <rect x="0" y="-20" width="560" height="440" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`} mask={`url(#${maskId})`}>
        <g className="impact-stairs-belt">
          <StairSet />
          <g
            className="impact-stairs-belt-copy"
            transform={`translate(${-CYCLE_DX} ${CYCLE_DY})`}
          >
            <StairSet />
          </g>
        </g>
      </g>

      {/* Own flow: draw → tip → fade → twin replaces — infinite */}
      <RebornArrow
        lane="coral"
        pathD={CORAL_PATH}
        tipD={CORAL_TIP}
        stroke="var(--asip-coral)"
        strokeWidth={3}
      />
      <RebornArrow
        lane="yellow"
        pathD={YELLOW_PATH}
        tipD={YELLOW_TIP}
        stroke="var(--brand-mid)"
        strokeWidth={2.5}
      />
    </svg>
  );
}
