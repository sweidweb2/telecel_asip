import type { AlumniPageCopy } from "@/types/marketing-page";
import { cn } from "@/lib/utils";

type AlumniNoticeSectionProps = {
  notice: AlumniPageCopy["notice"];
  className?: string;
};

/**
 * Quiet pre-launch status strip. Renders only when visitor-facing notice copy
 * is set — empty by default until the Alumni Network is formally confirmed.
 */
export function AlumniNoticeSection({
  notice,
  className,
}: AlumniNoticeSectionProps) {
  const trimmed = notice.trim();
  if (!trimmed) return null;

  return (
    <section
      id="notice"
      aria-label={trimmed}
      className={cn("border-b border-border bg-background", className)}
    >
      <div
        data-reveal="fade"
        className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      >
        <div className="rounded-2xl border border-border bg-muted/40 px-5 py-6 sm:px-8 sm:py-7">
          <span
            className="mb-3 block h-0.5 w-10 bg-asip-coral"
            aria-hidden
          />
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            {trimmed}
          </p>
        </div>
      </div>
    </section>
  );
}
