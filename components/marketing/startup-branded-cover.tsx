import Image from "next/image";

import { startupInitials } from "@/lib/startup-display";
import { cn } from "@/lib/utils";

type StartupBrandedCoverProps = {
  startup: {
    name: string;
    cohort: string | null;
    logo_url: string | null;
  };
  className?: string;
};

/**
 * Upper image area for startups without founder photography: ink field,
 * fine dot grid, and the company logo as the main mark (or initials).
 * Fills its (relative) parent.
 */
export function StartupBrandedCover({
  startup,
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
      {startup.logo_url ? (
        <span className="relative block h-[42%] w-[52%] max-w-64 rounded-xl bg-white p-3 shadow-lg sm:p-4">
          <span className="relative block size-full">
            <Image
              src={startup.logo_url}
              alt=""
              fill
              sizes="16rem"
              className="object-contain"
            />
          </span>
        </span>
      ) : (
        <span className="font-heading text-4xl font-semibold tracking-tight text-white/80 sm:text-5xl">
          {startupInitials(startup.name)}
        </span>
      )}
    </div>
  );
}
