import type { AdminFormHelpSection } from "@/types/admin-form-help";

export const IMPACT_METRIC_EDITOR_HELP = {
  claim: {
    title: "Claim",
    intro: "The metric statement visitors see when this claim is published.",
    fields: [
      {
        name: "Claim label",
        detail:
          "Short name of the impact claim (e.g. “Founders supported”). Type to filter suggestions; free text is still allowed.",
      },
      {
        name: "Value",
        detail: "Numeric or textual value shown with the claim on public impact surfaces.",
      },
      {
        name: "Unit",
        detail: "Optional unit (%, people, GH₵, etc.) displayed next to the value.",
      },
    ],
  },
  periodEvidence: {
    title: "Period & evidence",
    intro: "Measurement window and backing evidence record.",
    fields: [
      {
        name: "Period start / end",
        detail: "Time range the metric covers. Important for credibility on public pages.",
      },
      {
        name: "Evidence record",
        detail:
          "Required link to an evidence entry. Verified claims should point at solid source records.",
      },
    ],
  },
  publishing: {
    title: "Publishing & scope",
    intro: "Visibility, thematic lens, and where the metric may appear.",
    fields: [
      {
        name: "Publish status",
        detail:
          "Controls CMS workflow and public eligibility (e.g. pending, verified, not for publication).",
      },
      {
        name: "Impact lens",
        detail: "Thematic grouping for filtering and storytelling on impact pages.",
      },
      {
        name: "Geography",
        detail:
          "Optional geographic scope of the claim. Type to filter region/country suggestions.",
      },
      {
        name: "Display locations",
        detail:
          "Where this metric may appear (one tag per line, e.g. homepage_module_02, impact_page). Suggestions replace the line you are typing.",
      },
    ],
  },
} as const satisfies Record<string, AdminFormHelpSection>;
