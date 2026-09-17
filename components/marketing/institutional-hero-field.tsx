import "./institutional-hero-field.css";

/**
 * Decorative “institutional night panel” field — geometric structure under soft
 * atmospheric light. ASIP ink/teal palette. Non-interactive; place behind content.
 *
 * Each `composition` changes motifs, silk paths, and orb/hatch positioning so
 * pages share a family without looking cloned.
 */

export type InstitutionalComposition =
  | "aurora"
  | "ledger"
  | "constellation"
  | "horizon"
  | "blueprint"
  | "portal"
  | "gateway"
  | "signal";

type InstitutionalHeroFieldProps = {
  /** Unique id prefix when more than one field could mount (tests, nested). */
  patternId?: string;
  composition?: InstitutionalComposition;
};

function SilkDefs({
  silkGrad,
  silkGold,
  softGlow,
}: {
  silkGrad: string;
  silkGold: string;
  softGlow: string;
}) {
  return (
    <defs>
      <linearGradient id={silkGrad} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#9ad1bf" stopOpacity="0" />
        <stop offset="35%" stopColor="#9ad1bf" stopOpacity="0.55" />
        <stop offset="70%" stopColor="#179191" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#179191" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={silkGold} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9ad1bf" stopOpacity="0" />
        <stop offset="40%" stopColor="#f5e6b8" stopOpacity="0.35" />
        <stop offset="75%" stopColor="#81b764" stopOpacity="0.28" />
        <stop offset="100%" stopColor="#81b764" stopOpacity="0" />
      </linearGradient>
      <filter id={softGlow} x="-20%" y="-40%" width="140%" height="180%">
        <feGaussianBlur stdDeviation="2.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

function Motifs({
  composition,
}: {
  composition: InstitutionalComposition;
}) {
  switch (composition) {
    case "aurora":
      return (
        <>
          <g
            opacity="0.16"
            stroke="#9ad1bf"
            strokeWidth="1.25"
            transform="translate(780 48)"
          >
            <polygon points="180,18 342,298 18,298" />
            <polygon points="180,72 292,268 68,268" />
            <circle cx="180" cy="18" r="3.5" fill="#9ad1bf" stroke="none" />
            <circle cx="342" cy="298" r="3.5" fill="#9ad1bf" stroke="none" />
            <circle cx="18" cy="298" r="3.5" fill="#9ad1bf" stroke="none" />
          </g>
          <g
            opacity="0.14"
            stroke="#9ad1bf"
            strokeWidth="1"
            strokeDasharray="6 7"
            transform="translate(72 360) rotate(-12)"
          >
            <polygon points="110,12 210,188 10,188" />
          </g>
        </>
      );
    case "ledger":
      return (
        <>
          <g
            opacity="0.15"
            stroke="#9ad1bf"
            strokeWidth="1.2"
            transform="translate(40 40) rotate(8)"
          >
            <polygon points="120,10 230,210 10,210" />
            <polygon points="120,55 190,185 50,185" />
          </g>
          <g
            opacity="0.13"
            stroke="#81b764"
            strokeWidth="1"
            strokeDasharray="4 8"
            transform="translate(860 300) rotate(18)"
          >
            <polygon points="100,8 190,170 10,170" />
          </g>
          <circle
            cx="620"
            cy="120"
            r="46"
            opacity="0.12"
            stroke="#9ad1bf"
            strokeWidth="1"
          />
        </>
      );
    case "constellation":
      return (
        <>
          <g opacity="0.15" stroke="#9ad1bf" strokeWidth="1.15">
            <circle cx="920" cy="160" r="72" />
            <circle cx="920" cy="160" r="42" strokeDasharray="5 6" />
            <circle cx="920" cy="160" r="3.5" fill="#9ad1bf" stroke="none" />
          </g>
          <g
            opacity="0.12"
            stroke="#9ad1bf"
            strokeWidth="1"
            transform="translate(80 380)"
          >
            <circle cx="90" cy="90" r="88" strokeDasharray="3 7" />
            <line x1="90" y1="2" x2="90" y2="178" />
            <line x1="2" y1="90" x2="178" y2="90" />
          </g>
          <g opacity="0.18" fill="#9ad1bf">
            <circle cx="540" cy="90" r="2.5" />
            <circle cx="610" cy="140" r="2" />
            <circle cx="480" cy="150" r="2" />
            <circle cx="700" cy="80" r="1.8" />
          </g>
        </>
      );
    case "horizon":
      return (
        <>
          <g
            opacity="0.14"
            stroke="#9ad1bf"
            strokeWidth="1.3"
            transform="translate(620 220) rotate(6)"
          >
            <polygon points="220,20 420,360 20,360" />
            <circle cx="220" cy="20" r="3.5" fill="#f5e6b8" stroke="none" />
            <circle cx="420" cy="360" r="3" fill="#9ad1bf" stroke="none" />
            <circle cx="20" cy="360" r="3" fill="#9ad1bf" stroke="none" />
          </g>
          <g
            opacity="0.12"
            stroke="#81b764"
            strokeWidth="1"
            strokeDasharray="7 6"
            transform="translate(60 60) rotate(-22)"
          >
            <polygon points="80,8 150,128 10,128" />
          </g>
        </>
      );
    case "blueprint":
      return (
        <>
          <g
            opacity="0.14"
            stroke="#9ad1bf"
            strokeWidth="1.1"
            transform="translate(880 80) rotate(45)"
          >
            <rect x="0" y="0" width="140" height="140" />
            <rect x="28" y="28" width="84" height="84" strokeDasharray="4 5" />
          </g>
          <g
            opacity="0.13"
            stroke="#179191"
            strokeWidth="1"
            transform="translate(80 300) rotate(12)"
          >
            <polygon points="70,0 140,40 140,110 70,150 0,110 0,40" />
          </g>
          <g opacity="0.16" stroke="#9ad1bf" strokeWidth="1">
            <line x1="400" y1="40" x2="400" y2="200" strokeDasharray="2 6" />
            <line x1="360" y1="80" x2="520" y2="80" strokeDasharray="2 6" />
          </g>
        </>
      );
    case "portal":
      return (
        <>
          <g
            opacity="0.14"
            stroke="#9ad1bf"
            strokeWidth="1.2"
            transform="translate(180 160) rotate(45)"
          >
            <rect x="0" y="0" width="120" height="120" />
            <rect x="24" y="24" width="72" height="72" />
          </g>
          <g
            opacity="0.13"
            stroke="#9ad1bf"
            strokeWidth="1.15"
            transform="translate(820 280) rotate(-8)"
          >
            <polygon points="140,10 270,240 10,240" />
          </g>
          <circle
            cx="600"
            cy="320"
            r="110"
            opacity="0.1"
            stroke="#f5e6b8"
            strokeWidth="1"
            strokeDasharray="5 9"
          />
        </>
      );
    case "gateway":
      return (
        <>
          <g
            opacity="0.15"
            stroke="#9ad1bf"
            strokeWidth="1.25"
            transform="translate(740 40)"
          >
            <polygon points="160,12 300,250 20,250" />
            <circle cx="160" cy="12" r="3.5" fill="#9ad1bf" stroke="none" />
            <circle cx="300" cy="250" r="3" fill="#9ad1bf" stroke="none" />
            <circle cx="20" cy="250" r="3" fill="#9ad1bf" stroke="none" />
          </g>
          <g
            opacity="0.12"
            stroke="#81b764"
            strokeWidth="1"
            transform="translate(100 420) rotate(-18)"
          >
            <polygon points="90,8 170,150 10,150" strokeDasharray="6 5" />
          </g>
          <g opacity="0.14" stroke="#9ad1bf" strokeWidth="1">
            <circle cx="280" cy="140" r="54" />
            <circle cx="280" cy="140" r="28" strokeDasharray="3 5" />
          </g>
        </>
      );
    case "signal":
      return (
        <>
          <g
            opacity="0.15"
            stroke="#9ad1bf"
            strokeWidth="1.2"
            transform="translate(700 100) rotate(-6)"
          >
            <polygon points="150,16 280,250 20,250" />
            <polygon points="150,70 230,220 70,220" />
          </g>
          <g opacity="0.14" stroke="#179191" strokeWidth="1.1">
            <path d="M120 480 C220 420, 320 520, 420 460 S580 400, 680 470" />
            <circle cx="120" cy="480" r="3" fill="#9ad1bf" stroke="none" />
            <circle cx="420" cy="460" r="2.5" fill="#9ad1bf" stroke="none" />
            <circle cx="680" cy="470" r="3" fill="#81b764" stroke="none" />
          </g>
        </>
      );
    default:
      return null;
  }
}

function SilkPaths({
  composition,
  silkGrad,
  silkGold,
  softGlow,
}: {
  composition: InstitutionalComposition;
  silkGrad: string;
  silkGold: string;
  softGlow: string;
}) {
  const stroke = (id: string) => `url(#${id})`;
  const glow = `url(#${softGlow})`;

  switch (composition) {
    case "aurora":
      return (
        <>
          <path
            d="M-40 92 C180 48, 320 148, 520 88 S860 28, 1240 110"
            stroke={stroke(silkGrad)}
            strokeWidth="1.5"
            filter={glow}
            opacity="0.55"
          />
          <path
            d="M-40 540 C220 500, 380 590, 620 530 S940 470, 1240 560"
            stroke={stroke(silkGrad)}
            strokeWidth="1.25"
            filter={glow}
            opacity="0.4"
          />
          <path
            d="M96 -20 C48 160, 170 280, 70 420 S40 580, 130 680"
            stroke={stroke(silkGrad)}
            strokeWidth="1.35"
            filter={glow}
            opacity="0.45"
          />
          <path
            d="M1100 -10 C1160 140, 1040 260, 1140 400 S1180 560, 1060 670"
            stroke={stroke(silkGold)}
            strokeWidth="1.15"
            filter={glow}
            opacity="0.5"
          />
        </>
      );
    case "ledger":
      return (
        <>
          <path
            d="M-20 180 C200 120, 400 240, 640 160 S980 80, 1240 200"
            stroke={stroke(silkGrad)}
            strokeWidth="1.4"
            filter={glow}
            opacity="0.5"
          />
          <path
            d="M1240 480 C980 520, 760 400, 520 470 S200 560, -40 500"
            stroke={stroke(silkGold)}
            strokeWidth="1.2"
            filter={glow}
            opacity="0.45"
          />
          <path
            d="M1080 -30 C1020 180, 1140 320, 1000 480 S1060 620, 1120 700"
            stroke={stroke(silkGrad)}
            strokeWidth="1.1"
            filter={glow}
            opacity="0.35"
          />
        </>
      );
    case "constellation":
      return (
        <>
          <path
            d="M-40 220 C160 160, 360 280, 560 200 S900 120, 1240 240"
            stroke={stroke(silkGrad)}
            strokeWidth="1.35"
            filter={glow}
            opacity="0.5"
          />
          <path
            d="M200 -20 C260 140, 140 300, 240 460 S180 600, 280 700"
            stroke={stroke(silkGold)}
            strokeWidth="1.2"
            filter={glow}
            opacity="0.4"
          />
          <path
            d="M1000 40 C940 200, 1080 340, 960 500 S1020 620, 900 700"
            stroke={stroke(silkGrad)}
            strokeWidth="1.15"
            filter={glow}
            opacity="0.38"
          />
        </>
      );
    case "horizon":
      return (
        <>
          <path
            d="M-40 360 C200 300, 420 420, 640 340 S960 260, 1240 380"
            stroke={stroke(silkGold)}
            strokeWidth="1.6"
            filter={glow}
            opacity="0.55"
          />
          <path
            d="M-40 80 C280 140, 480 20, 720 90 S1000 160, 1240 70"
            stroke={stroke(silkGrad)}
            strokeWidth="1.2"
            filter={glow}
            opacity="0.4"
          />
          <path
            d="M80 -10 C20 200, 160 360, 40 520 S60 640, 140 720"
            stroke={stroke(silkGrad)}
            strokeWidth="1.1"
            filter={glow}
            opacity="0.35"
          />
        </>
      );
    case "blueprint":
      return (
        <>
          <path
            d="M40 -20 C120 160, 40 320, 140 480 S80 620, 160 720"
            stroke={stroke(silkGrad)}
            strokeWidth="1.3"
            filter={glow}
            opacity="0.45"
          />
          <path
            d="M1160 -20 C1080 180, 1180 340, 1060 500 S1120 640, 1040 720"
            stroke={stroke(silkGrad)}
            strokeWidth="1.3"
            filter={glow}
            opacity="0.4"
          />
          <path
            d="M-40 500 C240 460, 480 560, 720 490 S1000 430, 1240 520"
            stroke={stroke(silkGold)}
            strokeWidth="1.15"
            filter={glow}
            opacity="0.4"
          />
        </>
      );
    case "portal":
      return (
        <>
          <path
            d="M-40 160 C220 100, 420 220, 640 140 S980 60, 1240 180"
            stroke={stroke(silkGrad)}
            strokeWidth="1.45"
            filter={glow}
            opacity="0.5"
          />
          <path
            d="M-40 500 C260 560, 500 440, 740 520 S1020 580, 1240 480"
            stroke={stroke(silkGold)}
            strokeWidth="1.25"
            filter={glow}
            opacity="0.45"
          />
          <path
            d="M600 -40 C520 160, 700 300, 560 460 S640 620, 580 720"
            stroke={stroke(silkGrad)}
            strokeWidth="1.1"
            filter={glow}
            opacity="0.32"
          />
        </>
      );
    case "gateway":
      return (
        <>
          <path
            d="M1240 120 C980 60, 740 180, 500 100 S220 40, -40 140"
            stroke={stroke(silkGrad)}
            strokeWidth="1.4"
            filter={glow}
            opacity="0.5"
          />
          <path
            d="M40 -20 C100 200, -20 360, 120 520 S60 640, 160 720"
            stroke={stroke(silkGold)}
            strokeWidth="1.2"
            filter={glow}
            opacity="0.42"
          />
          <path
            d="M-40 560 C280 500, 560 600, 820 530 S1080 470, 1240 560"
            stroke={stroke(silkGrad)}
            strokeWidth="1.15"
            filter={glow}
            opacity="0.38"
          />
        </>
      );
    case "signal":
      return (
        <>
          <path
            d="M-40 100 C240 160, 480 40, 720 120 S1000 200, 1240 90"
            stroke={stroke(silkGrad)}
            strokeWidth="1.35"
            filter={glow}
            opacity="0.48"
          />
          <path
            d="M-40 420 C200 360, 420 480, 660 400 S980 320, 1240 440"
            stroke={stroke(silkGold)}
            strokeWidth="1.4"
            filter={glow}
            opacity="0.5"
          />
          <path
            d="M1120 -20 C1180 160, 1040 300, 1160 460 S1100 620, 1180 700"
            stroke={stroke(silkGrad)}
            strokeWidth="1.1"
            filter={glow}
            opacity="0.36"
          />
        </>
      );
    default:
      return null;
  }
}

export function InstitutionalHeroField({
  patternId = "institutional-hero",
  composition = "aurora",
}: InstitutionalHeroFieldProps) {
  const silkGrad = `${patternId}-silk`;
  const silkGold = `${patternId}-silk-gold`;
  const softGlow = `${patternId}-glow`;

  return (
    <div
      className="institutional-hero-field pointer-events-none absolute inset-0 overflow-hidden"
      data-composition={composition}
      aria-hidden
    >
      <div className="institutional-hero-field__wash" />
      <div className="institutional-hero-field__hatch" />

      <div className="institutional-hero-field__orbs">
        <span className="institutional-hero-field__orb institutional-hero-field__orb--a" />
        <span className="institutional-hero-field__orb institutional-hero-field__orb--b" />
        <span className="institutional-hero-field__orb institutional-hero-field__orb--c" />
      </div>

      <svg
        className="institutional-hero-field__motifs absolute inset-0 h-full w-full"
        viewBox="0 0 1200 640"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <Motifs composition={composition} />
      </svg>

      <div className="institutional-hero-field__dots" />

      <svg
        className="institutional-hero-field__silk absolute inset-0 h-full w-full"
        viewBox="0 0 1200 640"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <SilkDefs
          silkGrad={silkGrad}
          silkGold={silkGold}
          softGlow={softGlow}
        />
        <SilkPaths
          composition={composition}
          silkGrad={silkGrad}
          silkGold={silkGold}
          softGlow={softGlow}
        />
      </svg>
    </div>
  );
}
