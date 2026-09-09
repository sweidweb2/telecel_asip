import type { AdminFormHelpSection } from "@/types/admin-form-help";

export const SITE_SETTINGS_HELP = {
  applications: {
    title: "Applications open",
    intro:
      "Mutual gate between Apply and Register Interest — only one intake path is live.",
    fields: [
      {
        name: "Applications open",
        detail:
          "On: navbar/footer promote Apply, banner can show, Apply is indexable/in sitemap and accepts submits; /register-interest redirects to Apply and rejects lead submits. Off: navbar/footer promote Register Interest, banner hidden, Register Interest is indexable/in sitemap and accepts leads; /apply redirects to Register Interest and rejects application submits.",
      },
    ],
  },
  newsletter: {
    title: "Newsletter signup",
    intro: "Phase 1 status only — not a live control.",
    fields: [
      {
        name: "Newsletter signup",
        detail:
          "The Insights newsletter module is hidden for phase 1. There is no public signup UI and the setting stays off. A toggle returns in a later phase after privacy, routing, and ownership are confirmed.",
      },
    ],
  },
  backup: {
    title: "Automated backup schedule",
    intro: "Cadence for full database backups to private R2 (Lebanon time).",
    fields: [
      {
        name: "Backup schedule",
        detail:
          "Times are Asia/Beirut. Off disables the hourly cron tick. Choose weekly Sunday or Monday 03:00. Use Run backup now on the Backup page for a one-shot.",
      },
    ],
  },
} as const satisfies Record<string, AdminFormHelpSection>;
