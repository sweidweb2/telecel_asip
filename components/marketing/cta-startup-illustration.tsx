/**
 * Decorative startup motif for closing CTAs — waves + abstract growth shapes.
 * Part of the section markup (not a pasted raster image).
 */
export function CtaStartupIllustration({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 480 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
    >
      {/* Left wavy accents */}
      <path
        d="M8 78c28-18 48-10 72 4s44 22 68 6"
        stroke="#179191"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 92c30-14 52-6 76 8s42 18 70 2"
        stroke="#c14a9b"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M12 64c26-12 46-4 68 10s40 16 62 0"
        stroke="#3b82c4"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Right wavy accents */}
      <path
        d="M332 84c24 16 44 8 68-6s44-22 68-6"
        stroke="#179191"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M336 98c22 12 46 4 70-8s40-16 66 0"
        stroke="#c14a9b"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M340 70c20 10 42 2 64-8s42-14 64 2"
        stroke="#3b82c4"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Soft ground shadow */}
      <ellipse cx="240" cy="132" rx="72" ry="10" fill="#14333b" opacity="0.08" />

      {/* Growth bars */}
      <rect x="188" y="86" width="18" height="36" rx="5" fill="#f59e0b" />
      <rect x="212" y="68" width="18" height="54" rx="5" fill="#179191" />
      <rect x="236" y="52" width="18" height="70" rx="5" fill="#dc395f" />

      {/* Building / stack */}
      <rect x="268" y="70" width="42" height="52" rx="8" fill="#14333b" />
      <rect x="276" y="80" width="10" height="10" rx="2" fill="#fbfaf6" opacity="0.9" />
      <rect x="292" y="80" width="10" height="10" rx="2" fill="#fbfaf6" opacity="0.9" />
      <rect x="276" y="96" width="10" height="10" rx="2" fill="#fbfaf6" opacity="0.7" />
      <rect x="292" y="96" width="10" height="10" rx="2" fill="#fbfaf6" opacity="0.7" />

      {/* Rocket */}
      <path
        d="M156 108c0-22 14-42 28-52 4 16 8 30 4 48-10 2-22 4-32 4Z"
        fill="#c14a9b"
      />
      <circle cx="178" cy="78" r="5" fill="#fbfaf6" />
      <path d="M156 108c-8 4-14 12-16 18 10-2 18-6 24-12Z" fill="#dc395f" />
      <path d="M168 112c6 6 14 10 22 12-2-8-8-16-14-20Z" fill="#f59e0b" />

      {/* Idea spark */}
      <circle cx="252" cy="40" r="14" fill="#179191" opacity="0.95" />
      <path
        d="M252 32v8M246 36l4 4M258 36l-4 4"
        stroke="#fbfaf6"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
