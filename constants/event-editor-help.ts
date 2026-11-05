import type { AdminFormHelpSection } from "@/types/admin-form-help";

export const EVENT_EDITOR_HELP = {
  basics: {
    title: "Basics",
    intro:
      "Core event identity for the CMS. There is no public events marketing page yet, publish status prepares rows for when that surface ships.",
    fields: [
      {
        name: "Name",
        detail: "Event title in the CMS list. Not shown on a public events page today.",
      },
      {
        name: "Event date",
        detail: "When the event happens. Used for sorting in the admin list.",
      },
      {
        name: "Publish status",
        detail:
          "Draft vs published for CMS workflow. Publishing does not change the public site yet (no marketing events route).",
      },
    ],
  },
  details: {
    title: "Details",
    intro: "Where and how the event runs (admin catalog fields).",
    fields: [
      {
        name: "Location",
        detail:
          "Venue or place label. Type to filter city/venue suggestions; free text is still allowed. Optional for online-only events.",
      },
      {
        name: "Format",
        detail:
          "In-person, online, or hybrid. Helps admins understand attendance mode.",
      },
    ],
  },
  content: {
    title: "Content",
    intro: "Narrative fields stored for admin use until a public event detail exists.",
    fields: [
      {
        name: "Speakers",
        detail: "Optional speaker notes or names. Admin-only until a public detail ships.",
      },
      {
        name: "Assets",
        detail:
          "Optional links or notes for decks, recordings, or related files. Not a file uploader.",
      },
      {
        name: "Outcomes",
        detail:
          "Optional follow-up results or takeaways. Admin-only until a public detail ships.",
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
          "Select founders/startups related to the event. Stored for CMS relationships; not shown on a public event page yet.",
      },
    ],
  },
} as const satisfies Record<string, AdminFormHelpSection>;
