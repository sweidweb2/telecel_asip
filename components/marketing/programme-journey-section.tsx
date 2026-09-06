import HowItWorks, { type Step } from "@/components/ui/how-it-works";
import type { ProgrammePageCopy } from "@/types/marketing-page";

/** ASIP brand accents for journey pins (teal / green / magenta / crimson / ink). */
const JOURNEY_STEP_COLORS: NonNullable<Step["colors"]>[] = [
  {
    bg: "bg-[#179191]/10",
    text: "text-[#179191]",
    border: "border-[#179191]/25",
  },
  {
    bg: "bg-[#81b764]/10",
    text: "text-[#81b764]",
    border: "border-[#81b764]/25",
  },
  {
    bg: "bg-[#c14a9b]/10",
    text: "text-[#c14a9b]",
    border: "border-[#c14a9b]/25",
  },
  {
    bg: "bg-[#dc395f]/10",
    text: "text-[#dc395f]",
    border: "border-[#dc395f]/25",
  },
  {
    bg: "bg-[#14333b]/8",
    text: "text-[#14333b]",
    border: "border-[#14333b]/20",
  },
  {
    bg: "bg-[#179191]/10",
    text: "text-[#179191]",
    border: "border-[#179191]/25",
  },
];

type ProgrammeJourneySectionProps = {
  copy: ProgrammePageCopy["journey"];
};

/**
 * Programme “Founder journey” — horizontal how-it-works steps.
 */
export function ProgrammeJourneySection({
  copy,
}: ProgrammeJourneySectionProps) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {copy.title}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          {copy.title}
        </h2>
      </div>
      <HowItWorks
        className="bg-[#fbfaf6]"
        features={copy.steps.map((step, index) => ({
          title: step.title,
          description: step.description,
          colors: JOURNEY_STEP_COLORS[index % JOURNEY_STEP_COLORS.length],
        }))}
      />
    </section>
  );
}
