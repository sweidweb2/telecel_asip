import type { AdminFormHelpSection } from "@/types/admin-form-help";

export const FOUNDER_STORY_EDITOR_HELP = {
  startupStatus: {
    title: "Startup & status",
    intro: "Which portfolio company this story belongs to and whether it is public.",
    fields: [
      {
        name: "Startup",
        detail:
          "Required link to one portfolio startup. The public story is framed around this company.",
      },
      {
        name: "Publish status",
        detail:
          "Draft stays in the CMS. Published makes the founder story eligible on public storytelling surfaces.",
      },
    ],
  },
  storyModules: {
    title: "Story modules",
    intro: "Narrative blocks that structure the public founder story.",
    fields: [
      {
        name: "The problem",
        detail: "What the founder set out to solve. Shown in the public story layout.",
      },
      {
        name: "What they built",
        detail: "Product or company response to the problem.",
      },
      {
        name: "The ASIP connection",
        detail:
          "How ASIP and Telecel networks relate to the journey — keep attribution honest.",
      },
      {
        name: "Where they are now",
        detail: "Current traction or next chapter for the company.",
      },
    ],
  },
  founderQuote: {
    title: "Founder quote",
    intro: "Optional pull-quote with permission tracking. Leave blank if unused.",
    fields: [
      {
        name: "Quote text",
        detail: "Optional quote shown on the public story when present.",
      },
      {
        name: "Attribution name / title",
        detail: "Who said it and their role — shown with the quote when set.",
      },
      {
        name: "Quote date",
        detail: "Optional date the quote was given.",
      },
      {
        name: "Quote permission",
        detail:
          "Internal clearance status for publishing the quote. Use this before featuring quotes publicly.",
      },
    ],
  },
} as const satisfies Record<string, AdminFormHelpSection>;
