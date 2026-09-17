import { TreeCenteredHero } from "@/components/marketing/tree-centered-hero";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type { IntakeCta } from "@/lib/marketing/intake-cta";
import type { ProgrammePageCopy } from "@/types/marketing-page";

type ProgrammeHeroProps = {
  locale: Locale;
  copy: ProgrammePageCopy["hero"];
  intake: IntakeCta;
};

/**
 * Programme hero — light-mode centered stack over a branching-tree field.
 */
export function ProgrammeHero({ locale, copy, intake }: ProgrammeHeroProps) {
  return (
    <TreeCenteredHero
      tone="light"
      patternId="programme-hero-tree-tile"
      density="tall"
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      primaryCta={{ href: intake.href, label: intake.label }}
      secondaryCta={{
        href: publicPath(locale, copy.secondaryCta.slug),
        label: copy.secondaryCta.label,
      }}
    />
  );
}
