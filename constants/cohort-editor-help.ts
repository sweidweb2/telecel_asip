import type { AdminFormHelpSection } from "@/types/admin-form-help";

export const COHORT_EDITOR_HELP = {
  programme: {
    title: "Program",
    intro:
      "Cohort identity, dates, and publish state for public program storytelling.",
    fields: [
      {
        name: "Year",
        detail: "Program year used for sorting and labels in CMS and public cohort surfaces.",
      },
      {
        name: "Public label",
        detail:
          "Display name visitors see (e.g. “ASIP 2024”). Prefer a clear, human label over an internal code.",
      },
      {
        name: "Program start / end",
        detail: "Optional date range for the cohort run. Shown when the public UI surfaces dates.",
      },
      {
        name: "Program status",
        detail:
          "Lifecycle of the program itself: closed, open, or hold - separate from publish visibility.",
      },
      {
        name: "Publish status",
        detail:
          "Draft = admin only. Published = eligible for public program past-chapters when the cohort is listed.",
      },
      {
        name: "Summary",
        detail: "Short description of the cohort for public cards and detail intros.",
      },
      {
        name: "Media URL",
        detail:
          "Optional image or media URL for the cohort. Not processed as an upload in this form.",
      },
    ],
  },
  links: {
    title: "Links",
    intro: "Partners and founders tied to this cohort.",
    fields: [
      {
        name: "Partners",
        detail:
          "Optional partners associated with the cohort. Used for public and CMS relationship views.",
      },
      {
        name: "Founders / startups",
        detail:
          "Optional portfolio companies in this cohort. Powers cohort–startup relationships on the site.",
      },
    ],
  },
} as const satisfies Record<string, AdminFormHelpSection>;
