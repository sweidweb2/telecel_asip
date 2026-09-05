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
  return <path d={d} fill={color} opacity={opacity} />;
}

export function CtaStartupIllustration({
  className,
}: {
  className?: string;
}) {
  // Each wave: own undulation, rises into cluster, smooth tip (no hard join)
  const leftTeal: Point[] = [
    { x: 0, y: 128 },
    { x: 70, y: 148 },
    { x: 130, y: 148 },
    { x: 180, y: 128 },
    { x: 230, y: 108 },
    { x: 280, y: 108 },
    { x: 330, y: 124 },
    { x: 380, y: 140 },
    { x: 420, y: 100 },
    { x: 470, y: 56 },
  ];
  const leftPink: Point[] = [
    { x: 0, y: 142 },
    { x: 60, y: 118 },
    { x: 110, y: 118 },
    { x: 160, y: 138 },
    { x: 210, y: 158 },
    { x: 270, y: 152 },
    { x: 320, y: 130 },
    { x: 370, y: 108 },
    { x: 425, y: 100 },
    { x: 478, y: 70 },
  ];
  const leftBlue: Point[] = [
    { x: 0, y: 112 },
    { x: 80, y: 132 },
    { x: 140, y: 132 },
    { x: 190, y: 112 },
    { x: 240, y: 92 },
    { x: 290, y: 98 },
    { x: 340, y: 118 },
    { x: 390, y: 138 },
    { x: 435, y: 95 },
    { x: 476, y: 44 },
  ];

  const rightTeal: Point[] = [
    { x: 1200, y: 128 },
    { x: 1130, y: 148 },
    { x: 1070, y: 148 },
    { x: 1020, y: 128 },
    { x: 970, y: 108 },
    { x: 920, y: 108 },
    { x: 870, y: 124 },
    { x: 820, y: 140 },
    { x: 780, y: 100 },
    { x: 730, y: 56 },
  ];
  const rightPink: Point[] = [
    { x: 1200, y: 142 },
    { x: 1140, y: 118 },
    { x: 1090, y: 118 },
    { x: 1040, y: 138 },
    { x: 990, y: 158 },
    { x: 930, y: 152 },
    { x: 880, y: 130 },
    { x: 830, y: 108 },
    { x: 775, y: 100 },
    { x: 722, y: 70 },
  ];
  const rightBlue: Point[] = [
    { x: 1200, y: 112 },
    { x: 1120, y: 132 },
    { x: 1060, y: 132 },
    { x: 1010, y: 112 },
    { x: 960, y: 92 },
    { x: 910, y: 98 },
    { x: 860, y: 118 },
    { x: 810, y: 138 },
    { x: 765, y: 95 },
    { x: 724, y: 44 },
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
      <Wave points={leftTeal} color="#179191" width={2} />
      <Wave points={leftPink} color="#c14a9b" width={1.85} opacity={0.9} />
      <Wave points={leftBlue} color="#3b82c4" width={1.6} opacity={0.85} />

      <Wave points={rightTeal} color="#179191" width={2} />
      <Wave points={rightPink} color="#c14a9b" width={1.85} opacity={0.9} />
      <Wave points={rightBlue} color="#3b82c4" width={1.6} opacity={0.85} />

      <ellipse
        cx="600"
        cy="118"
        rx="72"
        ry="8"
        fill="#14333b"
        opacity="0.08"
      />

      <rect x="548" y="68" width="18" height="36" rx="5" fill="#f59e0b" />
      <rect x="572" y="50" width="18" height="54" rx="5" fill="#179191" />
      <rect x="596" y="34" width="18" height="70" rx="5" fill="#dc395f" />

      <rect x="628" y="52" width="42" height="52" rx="8" fill="#14333b" />
      <rect
        x="636"
        y="62"
        width="10"
        height="10"
        rx="2"
        fill="#fbfaf6"
        opacity="0.9"
      />
      <rect
        x="652"
        y="62"
        width="10"
        height="10"
        rx="2"
        fill="#fbfaf6"
        opacity="0.9"
      />
      <rect
        x="636"
        y="78"
        width="10"
        height="10"
        rx="2"
        fill="#fbfaf6"
        opacity="0.7"
      />
      <rect
        x="652"
        y="78"
        width="10"
        height="10"
        rx="2"
        fill="#fbfaf6"
        opacity="0.7"
      />

      <path
        d="M516 90c0-22 14-42 28-52 4 16 8 30 4 48-10 2-22 4-32 4Z"
        fill="#c14a9b"
      />
      <circle cx="538" cy="60" r="5" fill="#fbfaf6" />
      <path
        d="M516 90c-8 4-14 12-16 18 10-2 18-6 24-12Z"
        fill="#dc395f"
      />
      <path
        d="M528 94c6 6 14 10 22 12-2-8-8-16-14-20Z"
        fill="#f59e0b"
      />

      <circle cx="612" cy="22" r="14" fill="#179191" opacity="0.95" />
      <path
        d="M612 14v8M606 18l4 4M618 18l-4 4"
        stroke="#fbfaf6"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
