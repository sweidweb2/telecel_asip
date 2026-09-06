import type { AdminFormHelpSection } from "@/types/admin-form-help";

export const SITE_SETTINGS_HELP = {
  applications: {
    title: "Applications open",
    intro: "Controls public Apply vs Register Interest messaging — not page availability.",
    fields: [
      {
        name: "Applications open",
        detail:
          "On: navbar promotes Apply and a status banner can show under the nav. Off: navbar promotes Register Interest and the banner is hidden. Both Apply and Register Interest pages stay live; submissions still land in separate Applications and Leads tables.",
      },
    ],
  },
  newsletter: {
    title: "Newsletter signup",
    intro: "Gates the Insights newsletter module.",
    fields: [
      {
        name: "Newsletter signup",
        detail:
          "Off: Insights signup UI stays inactive and submissions are rejected. On: email + consent + Turnstile can collect subscribers into the database. Turn on only after privacy, routing, and ownership are confirmed.",
      },
    ],
  },
} as const satisfies Record<string, AdminFormHelpSection>;
