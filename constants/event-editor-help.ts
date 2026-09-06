import type { AdminFormHelpSection } from "@/types/admin-form-help";

export const EVENT_EDITOR_HELP = {
  basics: {
    title: "Basics",
    intro: "Core event identity and whether it appears on the public site.",
    fields: [
      {
        name: "Name",
        detail: "Event title in the CMS list and on public event surfaces when published.",
      },
      {
        name: "Event date",
        detail: "When the event happens. Used for sorting and display on listings and detail.",
      },
      {
        name: "Publish status",
        detail:
          "Draft stays admin-only. Published makes the event visible on public events pages.",
      },
    ],
  },
  details: {
    title: "Details",
    intro: "Where and how the event runs.",
    fields: [
      {
        name: "Location",
        detail:
          "Venue or place label shown publicly when set. Type to filter city/venue suggestions; free text is still allowed. Optional for online-only events.",
      },
      {
        name: "Format",
        detail:
          "In-person, online, or hybrid. Helps visitors understand attendance mode.",
      },
    ],
  },
  content: {
    title: "Content",
    intro: "Narrative fields for the public event detail page.",
    fields: [
      {
        name: "Speakers",
        detail: "Optional speaker notes or names shown on the event detail when present.",
      },
      {
        name: "Assets",
        detail:
          "Optional links or notes for decks, recordings, or related files. Not a file uploader.",
      },
      {
        name: "Outcomes",
        detail:
          "Optional follow-up results or takeaways shown on the public detail when present.",
      },
    ],
  },
  links: {
    title: "Linked startups",
    intro: "Optional portfolio connections for this event.",
    fields: [
      {
        name: "Linked startups",
        detail:
          "Select founders/startups related to the event. Shown as links on the public event detail when set. Not required to publish.",
      },
    ],
  },
} as const satisfies Record<string, AdminFormHelpSection>;
