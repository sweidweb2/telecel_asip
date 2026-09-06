/**
 * Technical blueprint schematic — Africa outline, network nodes, CAD annotations.
 * Stroke-only illustration for the lab playground / home spotlight.
 */

import {
  AFRICA_BLUEPRINT_NODES,
  AFRICA_MADAGASCAR_PATH,
  AFRICA_MAINLAND_PATH,
} from "@/constants/africa-blueprint-geometry";

export type BlueprintTone = "dark" | "light";

const NODES = AFRICA_BLUEPRINT_NODES;

/** Light network edges between nodes (index pairs). */
const EDGES: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [0, 3],
  [0, 5],
  [1, 2],
  [1, 5],
  [2, 3],
  [2, 4],
  [2, 5],
  [3, 4],
  [3, 5],
  [5, 4],
];

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
};

export function AfricaInnovationBlueprint({
  tone = "dark",
  titleBlock,
  className,
}: AfricaInnovationBlueprintProps) {
  const c = PALETTE[tone];
  const uid = `bp-${tone}`;

  return (
    <svg
      viewBox="0 0 1100 600"
      className={className}
      role="img"
      aria-label="Technical schematic of Africa’s innovation ecosystem"
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
          {EDGES.map(([a, b]) => {
            const from = NODES[a];
            const to = NODES[b];
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2 - 18;
            return (
              <path
                key={`${from.id}-${to.id}`}
                d={`M${from.x} ${from.y} Q${mx} ${my} ${to.x} ${to.y}`}
                strokeDasharray="4 6"
                markerEnd={`url(#${uid}-tick)`}
              />
            );
          })}
        </g>

        <path
          d={`M${NODES[0].x} ${NODES[0].y} Q${(NODES[0].x + NODES[3].x) / 2} ${
            (NODES[0].y + NODES[3].y) / 2 - 40
          } ${NODES[3].x} ${NODES[3].y}`}
          fill="none"
          stroke={c.accent}
          strokeWidth="1.25"
          opacity="0.75"
          strokeDasharray="2 4"
          className="blueprint-accent-path"
        />

        {NODES.map((node, index) => {
          const labelSide = node.x < 650 ? -1 : 1;
          const leaderX = node.x + labelSide * 30;
          const labelX = node.x + labelSide * 40;
          const anchor = labelSide < 0 ? "end" : "start";
          const nodeR = node.accent ? 12 : 10;

          return (
            <g key={node.id}>
              <line
                x1={node.x}
                y1={node.y}
                x2={leaderX}
                y2={node.y - 28}
                stroke={node.accent ? c.accent : c.line}
                strokeWidth="1.25"
                opacity="0.7"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeR}
                fill={c.nodeFill}
                stroke={node.accent ? c.accent : c.outline}
                strokeWidth={node.accent ? 2.25 : 1.75}
              />
              <circle
                cx={node.x}
                cy={node.y}
                r="4"
                fill={node.accent ? c.accent : c.outline}
              />
              <text
                x={labelX}
                y={node.y - 42}
                textAnchor={anchor}
                fill={node.accent ? c.accent : c.muted}
                fontSize="14"
                fontWeight="700"
                letterSpacing="0.12em"
                opacity="1"
              >
                {node.id}
              </text>
              <text
                x={labelX}
                y={node.y - 22}
                textAnchor={anchor}
                fill={c.label}
                fontSize="16"
                fontWeight="700"
                letterSpacing="0.06em"
                opacity="1"
              >
                {node.label}
              </text>
              <text
                x={node.x}
                y={node.y + nodeR + 16}
                textAnchor="middle"
                fill={c.line}
                fontSize="11"
                fontWeight="600"
                letterSpacing="0.08em"
                opacity="0.65"
              >
                N.{String(index + 1).padStart(2, "0")}
              </text>
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
