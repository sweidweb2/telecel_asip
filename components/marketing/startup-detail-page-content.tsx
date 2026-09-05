import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type { FounderStoryPublic } from "@/types/founder-story";
import type {
  StartupPublicDetail,
  StartupPublicListItem,
} from "@/types/startup";
import { cn } from "@/lib/utils";

function PageSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {note ? `${title} · ${note}` : title}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h2>
        <div className="mt-4 min-h-24 rounded-md border border-dashed border-muted-foreground/35 bg-muted/40 p-4 sm:p-6">
          {children}
        </div>
      </div>
    </section>
  );
}

function EmptySlot({ label }: { label: string }) {
  return (
    <p className="text-sm text-muted-foreground">Skeleton holder — {label}</p>
  );
}

function StoryBody({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground sm:text-base">
      {text}
    </p>
  );
}

type StartupDetailPageContentProps = {
  locale: Locale;
  startup: StartupPublicDetail;
  related: StartupPublicListItem[];
  story: FounderStoryPublic | null;
  fromPage?: number;
};

function foundersBackHref(locale: Locale, fromPage?: number) {
  const base = publicPath(locale, "founders");
  if (fromPage !== undefined && fromPage > 1) {
    return `${base}?page=${fromPage}`;
  }
  return base;
}

/**
 * Founder profile template — dynamic per Founder (build spec §4).
 * Story modules pull from published founder_stories when present.
 */
export function StartupDetailPageContent({
  locale,
  startup,
  related,
  story,
  fromPage,
}: StartupDetailPageContentProps) {
  return (
    <main>
      <section className="border-b border-border px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <Link
            href={foundersBackHref(locale, fromPage)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "mb-6 min-h-11 gap-2 px-0 hover:bg-transparent",
            )}
          >
            <ArrowLeft className="size-4" />
            {locale === "fr" ? "Retour aux fondateurs" : "Back to founders"}
          </Link>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Founder profile · Dynamic per Founder
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {startup.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {startup.description}
          </p>
          <div className="mt-6 min-h-24 rounded-md border border-dashed border-muted-foreground/35 bg-muted/40 p-4 sm:p-6">
            <EmptySlot label="cover, logo, and identity facts" />
          </div>
        </div>
      </section>

      <PageSection title="The problem" note="pulls Founder story">
        {story ? (
          <StoryBody text={story.the_problem} />
        ) : (
          <EmptySlot label="problem module" />
        )}
      </PageSection>

      <PageSection title="What they built" note="pulls Founder story">
        {story ? (
          <StoryBody text={story.what_they_built} />
        ) : (
          <EmptySlot label="product / build module" />
        )}
      </PageSection>

      <PageSection title="ASIP connection" note="pulls Founder story">
        {story ? (
          <StoryBody text={story.the_asip_connection} />
        ) : (
          <EmptySlot label="programme connection module" />
        )}
      </PageSection>

      <PageSection title="Where they are now" note="pulls Founder story">
        {story ? (
          <StoryBody text={story.where_they_are_now} />
        ) : (
          <EmptySlot label="outcome / progress module" />
        )}
      </PageSection>

      <PageSection
        title="Founder perspective"
        note="quote permission required"
      >
        {story?.quote ? (
          <blockquote className="space-y-3">
            <p className="text-base leading-relaxed sm:text-lg">
              “{story.quote.text}”
            </p>
            <footer className="text-sm text-muted-foreground">
              — {story.quote.attribution_name}
              {story.quote.attribution_title
                ? `, ${story.quote.attribution_title}`
                : null}
            </footer>
          </blockquote>
        ) : (
          <EmptySlot label="founder quote (only when permission = approved)" />
        )}
      </PageSection>

      <PageSection title="Media gallery" note="Dynamic">
        <EmptySlot label="approved media gallery" />
      </PageSection>

      <PageSection title="Related founders" note="pulls Founder">
        {related.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {related.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        ) : (
          <EmptySlot label="related founder cards" />
        )}
      </PageSection>
    </main>
  );
}
