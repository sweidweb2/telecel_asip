import { InstitutionalHero } from "@/components/marketing/institutional-hero";
import type { InstitutionalComposition } from "@/components/marketing/institutional-hero-field";
import { Section } from "@/components/marketing/page-elements";
import type { LegalPageCopy } from "@/types/marketing-page";

type LegalPageContentProps = {
  copy: LegalPageCopy;
  composition?: InstitutionalComposition;
  patternId?: string;
};

export function LegalPageContent({
  copy,
  composition = "aurora",
  patternId = "legal-hero",
}: LegalPageContentProps) {
  return (
    <main>
      <InstitutionalHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        headingId="legal-hero-heading"
        patternId={patternId}
        composition={composition}
        size="compact"
      />
      <Section className="max-w-3xl">
        {copy.notice ? (
          <p className="border-l-2 border-primary pl-4 text-sm text-muted-foreground">
            {copy.notice}
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">{copy.lastUpdated}</p>
        <div className="mt-10 space-y-10">
          {copy.sections.map((section) => (
            <article
              key={section.title}
              id={section.id}
              className="space-y-4 scroll-mt-24"
            >
              <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="leading-7 text-muted-foreground text-pretty"
                >
                  {paragraph}
                </p>
              ))}
            </article>
          ))}
        </div>
      </Section>
    </main>
  );
}
