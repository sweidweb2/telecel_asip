import Image from "next/image";

import { MARKETING_MEDIA } from "@/constants/marketing-media";
import { cn } from "@/lib/utils";

type AboutNarrativeVisualVariant = "vision" | "mission" | "telecel";

const VISUALS = {
  mission: MARKETING_MEDIA.about,
  vision: { ...MARKETING_MEDIA.about, src: "/asip-media/about-ecosystem.webp" },
  telecel: { ...MARKETING_MEDIA.about, src: "/asip-media/about-journey.webp" },
} satisfies Record<AboutNarrativeVisualVariant, typeof MARKETING_MEDIA.about>;

type AboutNarrativeSplitSectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  imagePosition: "left" | "right";
  imageVariant: AboutNarrativeVisualVariant;
  imageLabel: string;
};

export function AboutNarrativeSplitSection({
  id,
  eyebrow,
  title,
  paragraphs,
  imagePosition,
  imageVariant,
  imageLabel,
}: AboutNarrativeSplitSectionProps) {
  const media = VISUALS[imageVariant];
  const textOrder = imagePosition === "right" ? "order-1" : "order-1 lg:order-2";
  const imageOrder = imagePosition === "right" ? "order-2" : "order-2 lg:order-1";

  return (
    <section id={id} className="scroll-mt-20 editorial-rule pt-10 sm:pt-14">
      <div className="grid grid-cols-1 items-center gap-9 lg:grid-cols-12 lg:gap-12">
        <div className={cn("min-w-0 lg:col-span-5", textOrder)}>
          {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase text-primary">{eyebrow}</p> : null}
          <h2 className="font-heading text-3xl font-semibold leading-tight text-balance sm:text-4xl">{title}</h2>
          <div className="mt-6 flex flex-col gap-5">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="text-lg leading-8 text-muted-foreground">{paragraph}</p>
            ))}
          </div>
        </div>
        <figure className={cn("relative min-h-[24rem] overflow-hidden rounded-lg lg:col-span-7 lg:min-h-[34rem]", imageOrder)}>
          <Image src={media.src} alt={imageLabel} fill className="object-cover" style={{ objectPosition: media.position }} sizes="(max-width: 1024px) 100vw, 58vw" />
        </figure>
      </div>
    </section>
  );
}
