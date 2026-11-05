import Image from "next/image";

import { cn } from "@/lib/utils";

type AboutNarrativeVisualVariant = "vision" | "mission" | "telecel";

const VISUAL_CONFIG: Record<
  AboutNarrativeVisualVariant,
  { src: string; position: string }
> = {
  vision: {
    src: "/asip-media/insights-conversation.webp",
    position: "center 46%",
  },
  mission: {
    src: "/asip-media/about-origin.webp",
    position: "center 42%",
  },
  telecel: {
    src: "/images/about-telecel.jpeg",
    position: "center 42%",
  },
};

type AboutNarrativeSplitSectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  imagePosition: "left" | "right";
  imageVariant: AboutNarrativeVisualVariant;
  imageLabel: string;
};

function NarrativeVisual({
  variant,
  label,
}: {
  variant: AboutNarrativeVisualVariant;
  label: string;
}) {
  const media = VISUAL_CONFIG[variant];

  return (
    <figure className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-border bg-muted shadow-sm sm:aspect-[5/4]">
      <Image
        src={media.src}
        alt={label}
        fill
        className="object-cover transition-transform duration-700 hover:scale-[1.02]"
        style={{ objectPosition: media.position }}
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-asip-ink/80 via-asip-ink/35 to-transparent p-4 pt-16 sm:p-5 sm:pt-20">
        <p className="text-center text-xs font-medium uppercase tracking-[0.14em] text-white">
          {label}
        </p>
      </div>
    </figure>
  );
}

export function AboutNarrativeSplitSection({
  id,
  eyebrow,
  title,
  paragraphs,
  imagePosition,
  imageVariant,
  imageLabel,
}: AboutNarrativeSplitSectionProps) {
  const textOrder =
    imagePosition === "right" ? "order-1" : "order-1 lg:order-2";
  const imageOrder =
    imagePosition === "right" ? "order-2" : "order-2 lg:order-1";

  return (
    <section id={id} className="scroll-mt-20">
      <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className={cn("min-w-0", textOrder)}>
          {eyebrow ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="font-heading text-2xl font-semibold uppercase tracking-tight text-balance sm:text-3xl">
            {title}
          </h2>
          <div className="mt-5 flex flex-col gap-5 sm:mt-6 sm:gap-6">
            {paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className={cn("min-w-0", imageOrder)}>
          <NarrativeVisual variant={imageVariant} label={imageLabel} />
        </div>
      </div>
    </section>
  );
}
