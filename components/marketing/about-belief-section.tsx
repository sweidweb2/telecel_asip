import type { AboutBeliefCopy } from "@/types/marketing-page";

type AboutBeliefSectionProps = {
  belief: AboutBeliefCopy;
};

export function AboutBeliefSection({ belief }: AboutBeliefSectionProps) {
  return (
    <section id="belief" className="scroll-mt-20">
      <div className="rounded-2xl border bg-muted/40 px-5 py-10 text-center sm:px-10 sm:py-14 lg:px-16">
        {belief.eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {belief.eyebrow}
          </p>
        ) : null}
        <h2 className="mx-auto max-w-3xl font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {belief.title}
        </h2>
        <span
          aria-hidden
          className="mx-auto mt-4 block h-1 w-16 rounded-full bg-primary"
        />
        <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-5 sm:mt-8">
          {belief.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
