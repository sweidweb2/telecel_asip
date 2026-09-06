import type { AdminFormHelpSection } from "@/types/admin-form-help";

export const STARTUP_EDITOR_HELP = {
  core: {
    title: "Core",
    intro: "Identity fields for the portfolio company in CMS and public pages.",
    fields: [
      {
        name: "Name",
        detail: "Company name on admin lists and public portfolio surfaces when active.",
      },
      {
        name: "Slug",
        detail:
          "URL segment for the public portfolio detail route. Keep stable after publish.",
      },
      {
        name: "Description",
        detail: "Short company blurb for cards and detail intros.",
      },
      {
        name: "Status",
        detail:
          "Draft / active / inactive. Active companies are eligible for public portfolio listing.",
      },
      {
        name: "Founded at",
        detail: "Optional founding date for public profile context.",
      },
    ],
  },
  logo: {
    title: "Logo",
    intro: "Primary mark for portfolio cards and detail headers.",
    fields: [
      {
        name: "Logo image",
        detail:
          "Uploaded and processed for the site. Strongly recommended before marking the company active.",
      },
    ],
  },
  publicProfile: {
    title: "Public profile",
    intro: "Extra fields that shape the public portfolio profile.",
    fields: [
      {
        name: "Cohort / country / sector",
        detail: "Classification shown on public profile and filters when set.",
      },
      {
        name: "Founder names",
        detail: "People credited on the public profile.",
      },
      {
        name: "Cover image URL",
        detail: "Optional hero/cover URL for the profile (not the logo upload).",
      },
      {
        name: "Approved public outcome",
        detail:
          "Outcome text cleared for public use. Only publish claims you can stand behind.",
      },
      {
        name: "Featured profile",
        detail: "Highlights this company in featured portfolio placements when enabled.",
      },
      {
        name: "Image focus X / Y",
        detail: "Crop focus for cover/logo framing on responsive layouts.",
      },
    ],
  },
  detailsExtra: {
    title: "Company details",
    intro:
      "Deeper company, narrative, and funding fields. Optional — fill what you need for the public profile.",
    fields: [
      {
        name: "Website & company facts",
        detail:
          "Website, industry, category, location, founding year, size, and team notes for the profile.",
      },
      {
        name: "Narrative",
        detail:
          "Problem, solution, target market, and business model — shown when the public profile uses these modules.",
      },
      {
        name: "Funding",
        detail:
          "Funding goal and amount raised for profile context. Keep figures accurate and approved.",
      },
    ],
  },
} as const satisfies Record<string, AdminFormHelpSection>;
