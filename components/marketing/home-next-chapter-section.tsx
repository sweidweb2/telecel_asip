import { IllustratedWordmarkCta } from "@/components/marketing/illustrated-wordmark-cta";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type { IntakeCta } from "@/lib/marketing/intake-cta";
import { cn } from "@/lib/utils";
import type { HomePageCopy } from "@/types/marketing-page";

type HomeNextChapterSectionProps = {
  locale: Locale;
  copy: HomePageCopy["nextChapter"];
  intake: IntakeCta;
  className?: string;
};

/**
 * Home closing invitation — patterned wordmark, then the intake
 * action and the partnership conversation.
 */
export function HomeNextChapterSection({
  locale,
  copy,
  intake,
  className,
}: HomeNextChapterSectionProps) {
  return (
    <IllustratedWordmarkCta
      className={cn("home-module-seam-to border-b border-border", className)}
      title={copy.title}
      description={copy.description}
      primary={{ href: intake.href, label: intake.label }}
      secondary={{
        href: publicPath(locale, copy.secondaryCta.slug),
        label: copy.secondaryCta.label,
      }}
    />
  );
}
