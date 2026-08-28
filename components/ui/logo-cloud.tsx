import Image from "next/image";

import type { PartnerLogo } from "@/constants/partner-logos";
import { cn } from "@/lib/utils";

type LogoCloudGridProps = {
  logos: PartnerLogo[];
  className?: string;
};

export function LogoCloudGrid({ logos, className }: LogoCloudGridProps) {
  return (
    <ul
      className={cn(
        "mx-auto grid max-w-5xl grid-cols-2 items-center gap-x-8 gap-y-8 sm:grid-cols-3 sm:gap-x-10 sm:gap-y-10 lg:grid-cols-4",
        className,
      )}
    >
      {logos.map((logo) => (
        <li
          key={logo.name}
          className="flex h-16 items-center justify-center sm:h-20"
        >
          <Image
            src={logo.src}
            alt={`${logo.name} logo`}
            width={200}
            height={64}
            className="h-auto max-h-10 w-auto max-w-[9.5rem] object-contain sm:max-h-12 sm:max-w-[11rem]"
          />
        </li>
      ))}
    </ul>
  );
}

type LogoCloudProps = {
  title?: string;
  logos: PartnerLogo[];
  id?: string;
  className?: string;
};

export default function LogoCloud({
  title,
  logos,
  id = "partners",
  className,
}: LogoCloudProps) {
  return (
    <section id={id} className={cn("scroll-mt-20 bg-background py-12 sm:py-16", className)}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {title ? (
          <h2 className="text-center text-base font-medium text-balance sm:text-lg">
            {title}
          </h2>
        ) : null}
        <LogoCloudGrid
          logos={logos}
          className={title ? "mt-12 sm:mt-16" : undefined}
        />
      </div>
    </section>
  );
}
