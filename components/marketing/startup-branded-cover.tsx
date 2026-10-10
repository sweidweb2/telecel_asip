import Image from "next/image";

import { startupInitials } from "@/lib/startup-display";
import { cn } from "@/lib/utils";

type StartupBrandedCoverProps = {
  startup: {
    name: string;
    cohort: string | null;
    logo_url: string | null;
  };
  /** Hide the centred logo when the parent already overlays one. */
  showMark?: boolean;
  className?: string;
};

/**
 * Restrained graphic cover for startups without real founder photography:
 * ink field, a fine dot grid and the company's own mark. The card around it
 * carries the cohort colour in its top rule.
 * Fills its (relative) parent.
 */
export function StartupBrandedCover({
  startup,
  showMark = true,
  className,
}: StartupBrandedCoverProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 isolate flex items-center justify-center overflow-hidden bg-asip-ink",
        className,
      )}
    >
      <span
        className="absolute inset-0 -z-10 opacity-[0.09]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />
      {showMark ? (
        startup.logo_url ? (
          <span className="relative block h-[38%] w-[46%] max-w-56 rounded-xl bg-white p-3 shadow-lg">
            <span className="relative block size-full">
              <Image
                src={startup.logo_url}
                alt=""
                fill
                sizes="14rem"
                className="object-contain"
              />
            </span>
          </span>
        ) : (
          <span className="font-heading text-4xl font-semibold tracking-tight text-white/80 sm:text-5xl">
            {startupInitials(startup.name)}
          </span>
        )
      ) : null}
    </div>
  );
}
