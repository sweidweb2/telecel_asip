import type { AdminFormHelpSection } from "@/types/admin-form-help";

export const EVIDENCE_EDITOR_HELP = {
  source: {
    title: "Source",
    intro: "What backs impact claims that reference this evidence record.",
    fields: [
      {
        name: "Primary source",
        detail:
          "Human-readable source name or citation shown in the CMS and linked from metrics.",
      },
      {
        name: "Source file URL",
        detail:
          "Optional URL to the underlying file or page. Not uploaded here - paste a stable link.",
      },
    ],
  },
  periodOwner: {
    title: "Period & owner",
    intro: "When the evidence applies and who owns it in the CMS.",
    fields: [
      {
        name: "Period start / end",
        detail: "Measurement window covered by this evidence.",
      },
      {
        name: "Owner",
        detail:
          "Admin user responsible for the record. Used for accountability inside the CMS.",
      },
    ],
  },
  governance: {
    title: "Governance",
    intro: "Verification and permission state for using this evidence with impact metrics.",
    fields: [
      {
        name: "Status",
        detail:
          "One of: verified, pending, outdated, disputed, not for publication. Verified evidence is what linked public metrics should rest on.",
      },
      {
        name: "Permission",
        detail:
          "Whether the source may be cited or shown publicly (public, internal only, partner approval required, legal review required). Align with legal/comms clearance.",
      },
      {
        name: "Last verified / review date",
        detail:
          "Track when the evidence was last checked and when it should be reviewed again.",
      },
    ],
  },
} as const satisfies Record<string, AdminFormHelpSection>;
