/**
 * Closing-CTA illustration: wavy strokes that stay full weight, then
 * ease into a smooth tip (one filled ribbon per wave — no stroke/triangle join).
 */

type Point = { x: number; y: number };

function cubicPoint(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t: number,
): Point {
  const u = 1 - t;
  return {
    x:
      u * u * u * p0.x +
      3 * u * u * t * p1.x +
      3 * u * t * t * p2.x +
      t * t * t * p3.x,
    y:
      u * u * u * p0.y +
      3 * u * u * t * p1.y +
      3 * u * t * t * p2.y +
      t * t * t * p3.y,
  };
}

function cubicTangent(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t: number,
): Point {
  const u = 1 - t;
  return {
    x:
      3 * u * u * (p1.x - p0.x) +
      6 * u * t * (p2.x - p1.x) +
      3 * t * t * (p3.x - p2.x),
    y:
      3 * u * u * (p1.y - p0.y) +
      6 * u * t * (p2.y - p1.y) +
      3 * t * t * (p3.y - p2.y),
  };
}

/** Smoothstep ease for the tip zone. */
function tipEase(t: number, start = 0.72): number {
  if (t <= start) return 1;
  const u = (t - start) / (1 - start);
  const s = u * u * (3 - 2 * u);
  return 1 - s;
}

/** Polyline of cubics; width eases to 0 only in the final ~30%. */
function ribbonFromCubics(
  points: Point[],
  halfWidth: number,
  samplesPerSeg = 24,
): string {
  // points length must be 1 + 3*n (start + triples of control/end)
  const segs: [Point, Point, Point, Point][] = [];
  for (let i = 0; i + 3 < points.length; i += 3) {
    segs.push([points[i], points[i + 1], points[i + 2], points[i + 3]]);
  }

  const left: Point[] = [];
  const right: Point[] = [];
  const totalSegs = segs.length;

  segs.forEach((seg, si) => {
    const [p0, p1, p2, p3] = seg;
    for (let i = 0; i <= samplesPerSeg; i++) {
      // Skip duplicate joint at start of later segments
      if (si > 0 && i === 0) continue;
      const localT = i / samplesPerSeg;
      const globalT = (si + localT) / totalSegs;
      const p = cubicPoint(p0, p1, p2, p3, localT);
      const tan = cubicTangent(p0, p1, p2, p3, localT);
      const len = Math.hypot(tan.x, tan.y) || 1;
      const nx = -tan.y / len;
      const ny = tan.x / len;
      const hw = halfWidth * tipEase(globalT, 0.7);

      left.push({ x: p.x + nx * hw, y: p.y + ny * hw });
      right.push({ x: p.x - nx * hw, y: p.y - ny * hw });
    }
  });

  const tip = segs[segs.length - 1][3];
  let d = `M${left[0].x.toFixed(2)} ${left[0].y.toFixed(2)}`;
  for (let i = 1; i < left.length; i++) {
    d += ` L${left[i].x.toFixed(2)} ${left[i].y.toFixed(2)}`;
  }
  d += ` L${tip.x.toFixed(2)} ${tip.y.toFixed(2)}`;
  for (let i = right.length - 1; i >= 0; i--) {
    d += ` L${right[i].x.toFixed(2)} ${right[i].y.toFixed(2)}`;
  }
  d += " Z";
  return d;
}

function Wave({
  points,
  color,
  width,
  opacity = 1,
}: {
  /** Flat list: start, then c1,c2,end, c1,c2,end, … */
  points: Point[];
  color: string;
  width: number;
  opacity?: number;
}) {
  const d = ribbonFromCubics(points, width / 2);
  return (
    <path
      d={d}
      fill={color}
      opacity={opacity}
      vectorEffect="non-scaling-stroke"
    />
  );
}

export function CtaStartupIllustration({
  className,
}: {
  className?: string;
}) {
  // Tips aim at the cluster but stop short for clear breathing room.
  const leftTeal: Point[] = [
    { x: 0, y: 128 },
    { x: 70, y: 148 },
    { x: 130, y: 148 },
    { x: 180, y: 128 },
    { x: 230, y: 108 },
    { x: 280, y: 108 },
    { x: 330, y: 124 },
    { x: 370, y: 136 },
    { x: 410, y: 118 },
    { x: 448, y: 98 },
  ];
  const leftPink: Point[] = [
    { x: 0, y: 142 },
    { x: 60, y: 118 },
    { x: 110, y: 118 },
    { x: 160, y: 138 },
    { x: 210, y: 158 },
    { x: 270, y: 152 },
    { x: 320, y: 130 },
    { x: 365, y: 122 },
    { x: 415, y: 112 },
    { x: 456, y: 100 },
  ];
  const leftBlue: Point[] = [
    { x: 0, y: 112 },
    { x: 80, y: 132 },
    { x: 140, y: 132 },
    { x: 190, y: 112 },
    { x: 240, y: 92 },
    { x: 290, y: 98 },
    { x: 340, y: 118 },
    { x: 380, y: 128 },
    { x: 420, y: 108 },
    { x: 462, y: 88 },
  ];

  const rightTeal: Point[] = [
    { x: 1200, y: 128 },
    { x: 1130, y: 148 },
    { x: 1070, y: 148 },
    { x: 1020, y: 128 },
    { x: 970, y: 108 },
    { x: 920, y: 108 },
    { x: 870, y: 124 },
    { x: 830, y: 136 },
    { x: 790, y: 118 },
    { x: 752, y: 98 },
  ];
  const rightPink: Point[] = [
    { x: 1200, y: 142 },
    { x: 1140, y: 118 },
    { x: 1090, y: 118 },
    { x: 1040, y: 138 },
    { x: 990, y: 158 },
    { x: 930, y: 152 },
    { x: 880, y: 130 },
    { x: 835, y: 122 },
    { x: 785, y: 112 },
    { x: 744, y: 100 },
  ];
  const rightBlue: Point[] = [
    { x: 1200, y: 112 },
    { x: 1120, y: 132 },
    { x: 1060, y: 132 },
    { x: 1010, y: 112 },
    { x: 960, y: 92 },
    { x: 910, y: 98 },
    { x: 860, y: 118 },
    { x: 820, y: 128 },
    { x: 780, y: 108 },
    { x: 738, y: 88 },
  ];

  return (
    <svg
      className={className}
      viewBox="0 0 1200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="cta-orbit" x1="506" y1="116" x2="694" y2="30">
          <stop stopColor="var(--asip-magenta)" />
          <stop offset="0.52" stopColor="var(--brand)" />
          <stop offset="1" stopColor="var(--brand-mid)" />
        </linearGradient>
        <linearGradient id="cta-pillar" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#25a3a0" />
          <stop offset="1" stopColor="#147879" />
        </linearGradient>
        <filter id="cta-shadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="8"
            floodColor="var(--asip-ink)"
            floodOpacity="0.12"
          />
        </filter>
      </defs>
      <Wave points={leftTeal} color="var(--brand)" width={2} />
      <Wave points={leftPink} color="var(--asip-magenta)" width={1.85} opacity={0.9} />
      <Wave points={leftBlue} color="#3b82c4" width={1.6} opacity={0.85} />

      <Wave points={rightTeal} color="var(--brand)" width={2} />
      <Wave points={rightPink} color="var(--asip-magenta)" width={1.85} opacity={0.9} />
      <Wave points={rightBlue} color="#3b82c4" width={1.6} opacity={0.85} />

      <ellipse
        cx="600"
        cy="132"
        rx="104"
        ry="10"
        fill="var(--asip-ink)"
        opacity="0.08"
      />

      <g filter="url(#cta-shadow)">
        <rect
          x="522"
          y="48"
          width="156"
          height="78"
          rx="24"
          fill="var(--background)"
          stroke="var(--asip-ink)"
          strokeOpacity="0.08"
        />

        <path
          d="M544 105V91c0-5 4-9 9-9s9 4 9 9v14M574 105V73c0-5 4-9 9-9s9 4 9 9v32M604 105V55c0-5 4-9 9-9s9 4 9 9v50M634 105V37c0-5 4-9 9-9s9 4 9 9v68"
          stroke="url(#cta-pillar)"
          strokeWidth="15"
          strokeLinecap="round"
          opacity="0.96"
        />

        <path
          d="M540 94C560 91 569 78 582 78c15 0 18 10 31 5 15-6 18-28 34-34 9-4 17-4 27-2"
          fill="none"
          stroke="url(#cta-orbit)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M667 40l9 7-10 5"
          fill="none"
          stroke="var(--brand-mid)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        <circle cx="540" cy="94" r="7" fill="var(--asip-magenta)" />
        <circle cx="540" cy="94" r="3" fill="var(--background)" />
        <circle cx="582" cy="78" r="5" fill="#f59e0b" stroke="var(--background)" strokeWidth="2" />
        <circle cx="613" cy="83" r="5" fill="var(--brand)" stroke="var(--background)" strokeWidth="2" />
        <circle cx="647" cy="49" r="5" fill="var(--brand-mid)" stroke="var(--background)" strokeWidth="2" />
      </g>

      <circle cx="510" cy="54" r="3" fill="var(--asip-magenta)" opacity="0.7" />
      <circle cx="690" cy="92" r="3" fill="var(--brand)" opacity="0.65" />
      <circle cx="688" cy="34" r="2" fill="var(--brand-mid)" opacity="0.8" />
    </svg>
  );
}
