import Image from "next/image";

import { cn } from "@/lib/utils";

type ProgrammeBridgeConnectionIllustrationProps = {
  className?: string;
};

/**
 * Charcoal sketch — Bridge of Connection / Mentorship.
 * Same hand-drawn monochrome editorial style as the home impact kite.
 */
export function ProgrammeBridgeConnectionIllustration({
  className,
}: ProgrammeBridgeConnectionIllustrationProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "bridge-sketch-float w-full select-none",
        className,
      )}
    >
      <Image
        src="/asip-media/eligibility-bridge-connection.png"
        alt=""
        width={1152}
        height={864}
        sizes="(max-width: 640px) 22rem, (max-width: 1024px) 28rem, 32rem"
        className="h-auto w-full bg-transparent object-contain"
        priority={false}
        unoptimized
      />
    </div>
  );
}
