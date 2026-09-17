/**
 * Technical blueprint schematic — Africa outline, network nodes, CAD annotations.
 * Stroke-only illustration for the home founder spotlight.
 */

import {
  AFRICA_MADAGASCAR_PATH,
  AFRICA_MAINLAND_PATH,
  AFRICA_PORTFOLIO_COUNTRY_ANCHORS,
} from "@/constants/africa-blueprint-geometry";
import type { StartupCountryReach } from "@/types/startup";

export type BlueprintTone = "dark" | "light";

const PALETTE = {
  dark: {
    sheet: "#0b1c22",
    grid: "#7eb8b4",
    line: "#7eb8b4",
    outline: "#c5e4e0",
    label: "#e8f4f2",
    muted: "#9ec9c5",
    nodeFill: "#0b1c22",
    accent: "#179191",
    mapFillOpacity: 0.06,
    gridOpacity: 0.14,
    fineGridOpacity: 0.07,
  },
  light: {
    sheet: "#f4f7f5",
    grid: "#14333b",
    line: "#5a7a80",
    outline: "#14333b",
    label: "#14333b",
    muted: "#5a7a80",
    nodeFill: "#f4f7f5",
    accent: "#179191",
    mapFillOpacity: 0.08,
    gridOpacity: 0.1,
    fineGridOpacity: 0.06,
  },
} as const;

type AfricaInnovationBlueprintProps = {
  tone?: BlueprintTone;
  titleBlock: {
    eyebrow: string;
    title: string;
    detail: string;
  };
  className?: string;
  countryReach: StartupCountryReach[];
};

export function AfricaInnovationBlueprint({
  tone = "dark",
  titleBlock,
  className,
  countryReach,
}: AfricaInnovationBlueprintProps) {
  const c = PALETTE[tone];
  const uid = `bp-${tone}`;
  const nodes = countryReach.flatMap(({ countryCode, founderCount }) => {
    const anchor = AFRICA_PORTFOLIO_COUNTRY_ANCHORS[countryCode];
    return anchor ? [{ ...anchor, countryCode, founderCount }] : [];
  });
  const hub = nodes.reduce<(typeof nodes)[number] | undefined>(
    (current, node) =>
      !current || node.founderCount > current.founderCount ? node : current,
    undefined,
  );
  const accessibleReach = nodes
    .map((node) => `${node.label}: ${node.founderCount}`)
    .join(", ");

  return (
    <svg
      viewBox="0 0 1100 600"
      className={className}
      role="group"
      aria-label={`ASIP public portfolio footprint. ${accessibleReach}`}
    >
      <defs>
        <pattern
          id={`${uid}-grid`}
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M40 0H0V40"
            fill="none"
            stroke={c.grid}
            strokeWidth="0.5"
            opacity={c.gridOpacity}
          />
        </pattern>
        <pattern
          id={`${uid}-grid-fine`}
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M8 0H0V8"
            fill="none"
            stroke={c.grid}
            strokeWidth="0.35"
            opacity={c.fineGridOpacity}
          />
        </pattern>
        <marker
          id={`${uid}-tick`}
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <circle cx="3" cy="3" r="1.2" fill={c.line} opacity="0.7" />
        </marker>
      </defs>

      {/* Sheet */}
      <rect width="1100" height="600" fill={c.sheet} />
      <rect width="1100" height="600" fill={`url(#${uid}-grid-fine)`} />
      <rect width="1100" height="600" fill={`url(#${uid}-grid)`} />

      {/* Margin crop marks */}
      <g
        fill="none"
        stroke={c.line}
        strokeWidth="0.75"
        opacity="0.35"
        aria-hidden
      >
        <path d="M24 24h18M24 24v18" />
        <path d="M1076 24h-18M1076 24v18" />
        <path d="M24 576h18M24 576v-18" />
        <path d="M1076 576h-18M1076 576v-18" />
      </g>

      {/* Title block — bottom left, clear of frame edge */}
      <g aria-hidden>
        <rect
          x="36"
          y="392"
          width="280"
          height="112"
          fill="none"
          stroke={c.muted}
          strokeWidth="1"
          opacity="0.55"
        />
        <line
          x1="36"
          y1="428"
          x2="316"
          y2="428"
          stroke={c.muted}
          strokeWidth="0.8"
          opacity="0.4"
        />
        <line
          x1="36"
          y1="468"
          x2="316"
          y2="468"
          stroke={c.muted}
          strokeWidth="0.6"
          opacity="0.3"
        />
        <text
          x="52"
          y="416"
          fill={c.muted}
          fontSize="12"
          letterSpacing="0.2em"
          opacity="0.75"
        >
          {titleBlock.eyebrow.toUpperCase()}
        </text>
        <text
          x="52"
          y="454"
          fill={c.label}
          fontSize="16"
          letterSpacing="0.02em"
        >
          {titleBlock.title}
        </text>
        <text
          x="52"
          y="492"
          fill={c.muted}
          fontSize="12"
          letterSpacing="0.04em"
          opacity="0.75"
        >
          {titleBlock.detail}
        </text>
      </g>

      {/* Coordinate ticks along top of map zone */}
      <g stroke={c.line} strokeWidth="0.6" opacity="0.3" aria-hidden>
        {[480, 560, 640, 720, 800, 880].map((x, i) => (
          <g key={x}>
            <line x1={x} y1="36" x2={x} y2="48" />
            <text
              x={x}
              y="58"
              textAnchor="middle"
              fontSize="7"
              letterSpacing="0.08em"
              fill={c.muted}
              stroke="none"
              opacity="0.8"
            >
              {String.fromCharCode(65 + i)}
            </text>
          </g>
        ))}
      </g>

      {/* Map + network — Natural Earth outline, absolute viewBox coords */}
      <g>
        <path
          d={AFRICA_MAINLAND_PATH}
          fill={c.accent}
          fillOpacity={c.mapFillOpacity}
          stroke="none"
        />
        <path
          d={AFRICA_MAINLAND_PATH}
          fill="none"
          stroke={c.outline}
          strokeWidth="1.35"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={AFRICA_MADAGASCAR_PATH}
          fill={c.accent}
          fillOpacity={c.mapFillOpacity}
          stroke="none"
        />
        <path
          d={AFRICA_MADAGASCAR_PATH}
          fill="none"
          stroke={c.outline}
          strokeWidth="1.2"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* Light construction meridians across the continent */}
        <g
          fill="none"
          stroke={c.line}
          strokeWidth="0.55"
          strokeDasharray="3 5"
          opacity="0.22"
          aria-hidden
        >
          <path d="M560 120 L560 460" />
          <path d="M680 80 L680 480" />
          <path d="M800 160 L800 420" />
          <path d="M500 220 L880 220" />
          <path d="M520 340 L860 340" />
        </g>

        <g
          fill="none"
          stroke={c.line}
          strokeWidth="0.9"
          opacity="0.55"
          className="blueprint-network"
        >
          {hub
            ? nodes
                .filter((node) => node.countryCode !== hub.countryCode)
                .map((node) => {
                  const mx = (hub.x + node.x) / 2;
                  const my = (hub.y + node.y) / 2 - 12;
                  return (
                    <path
                      key={`${hub.countryCode}-${node.countryCode}`}
                      d={`M${hub.x} ${hub.y} Q${mx} ${my} ${node.x} ${node.y}`}
                      strokeDasharray="4 6"
                      markerEnd={`url(#${uid}-tick)`}
                    />
                  );
                })
            : null}
        </g>

        {nodes.map((node) => {
          const labelSide = node.x < 650 ? -1 : 1;
          const leaderX = node.x + labelSide * 18;
          const labelX = node.x + labelSide * 24;
          const anchor = labelSide < 0 ? "end" : "start";
          const isHub = node.countryCode === hub?.countryCode;
          const nodeR = isHub ? 10 : 7;
          const founderLabel =
            node.founderCount === 1 ? "1 founder" : `${node.founderCount} founders`;
          const boxW = 156;
          const boxH = 48;
          const boxGap = 14;
          const preferAbove = node.y >= 130;
          const boxX = Math.min(
            1100 - boxW - 24,
            Math.max(24, labelSide < 0 ? node.x - boxGap - boxW : node.x + boxGap),
          );
          const boxY = preferAbove
            ? node.y - nodeR - boxGap - boxH
            : node.y + nodeR + boxGap;

          return (
            <g
              key={node.countryCode}
              className="blueprint-node group/node outline-none"
              tabIndex={0}
              aria-label={`${node.label}: ${founderLabel}`}
            >
              {/* Larger hit target for hover / focus */}
              <circle
                cx={node.x}
                cy={node.y}
                r="22"
                fill="transparent"
                className="cursor-pointer"
              />
              <line
                x1={node.x}
                y1={node.y}
                x2={leaderX}
                y2={node.y - 16}
                stroke={isHub ? c.accent : c.line}
                strokeWidth="1"
                opacity="0.7"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeR}
                fill={c.nodeFill}
                stroke={isHub ? c.accent : c.outline}
                strokeWidth={isHub ? 2.25 : 1.5}
                className="transition-[stroke-width] duration-150 group-hover/node:stroke-[2.75] group-focus-visible/node:stroke-[2.75]"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r="4"
                fill={isHub ? c.accent : c.outline}
              />
              <text
                x={labelX}
                y={node.y - 22}
                textAnchor={anchor}
                fill={isHub ? c.accent : c.muted}
                fontSize="11"
                fontWeight="700"
                letterSpacing="0.12em"
                opacity="1"
              >
                {node.countryCode}
              </text>
              <text
                x={labelX}
                y={node.y - 8}
                textAnchor={anchor}
                fill={c.label}
                fontSize="10"
                fontWeight="700"
                letterSpacing="0.06em"
                opacity="1"
              >
                {node.founderCount}{" "}
                {node.founderCount === 1 ? "FOUNDER" : "FOUNDERS"}
              </text>

              {/* Hover / focus detail card */}
              <g
                aria-hidden
                className="pointer-events-none opacity-0 transition-opacity duration-150 group-hover/node:opacity-100 group-focus-visible/node:opacity-100"
              >
                <rect
                  x={boxX}
                  y={boxY}
                  width={boxW}
                  height={boxH}
                  rx="2"
                  fill={c.sheet}
                  stroke={isHub ? c.accent : c.outline}
                  strokeWidth="1.25"
                />
                <line
                  x1={boxX + 10}
                  y1={boxY + 24}
                  x2={boxX + boxW - 10}
                  y2={boxY + 24}
                  stroke={c.muted}
                  strokeWidth="0.7"
                  opacity="0.45"
                />
                <text
                  x={boxX + 12}
                  y={boxY + 16}
                  fill={isHub ? c.accent : c.label}
                  fontSize="11"
                  fontWeight="700"
                  letterSpacing="0.04em"
                >
                  {node.label}
                </text>
                <text
                  x={boxX + 12}
                  y={boxY + 38}
                  fill={c.muted}
                  fontSize="10"
                  fontWeight="600"
                  letterSpacing="0.06em"
                >
                  {founderLabel.toUpperCase()}
                </text>
              </g>
            </g>
          );
        })}

        <g opacity="0.55" aria-hidden>
          <line
            x1="880"
            y1="72"
            x2="960"
            y2="72"
            stroke={c.line}
            strokeWidth="0.7"
          />
          <text
            x="960"
            y="75"
            fill={c.muted}
            fontSize="8"
            letterSpacing="0.14em"
          >
            NET · LIVE
          </text>
        </g>
      </g>

      <rect
        x="16"
        y="16"
        width="1068"
        height="568"
        fill="none"
        stroke={c.line}
        strokeWidth="0.8"
        opacity="0.25"
      />
    </svg>
  );
}
