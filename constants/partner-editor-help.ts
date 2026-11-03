import type { AdminFormHelpSection } from "@/types/admin-form-help";

export const PARTNER_EDITOR_HELP = {
  identity: {
    title: "Identity",
    intro:
      "How this partner is named and ordered in the CMS and on public partner surfaces.",
    fields: [
      {
        name: "Name",
        detail:
          "Primary label shown in the admin list and on the public partners section when active.",
      },
      {
        name: "Organization",
        detail:
          "Optional company or institution name shown alongside the person/partner when provided.",
      },
      {
        name: "Type",
        detail:
          "Partner category used for grouping and filters in the CMS and public partner listings.",
      },
      {
        name: "Display order",
        detail:
          "Sort weight among partners (1–170, lower first). The order map paginates 170 slots per page. Choosing a taken number moves that partner to the first free slot on save.",
      },
    ],
  },
  profile: {
    title: "Profile",
    intro: "Optional context and outbound link for this partner.",
    fields: [
      {
        name: "Link",
        detail:
          "Optional external URL (website or profile). Used when the public UI links out from the partner.",
      },
      {
        name: "Role / contribution",
        detail:
          "How they work with ASIP. Type to filter suggested roles (e.g. Technology Partner), or enter a custom label.",
      },
    ],
  },
  visibility: {
    title: "Visibility",
    intro: "Controls whether the partner appears publicly and whether the logo may be shown.",
    fields: [
      {
        name: "Active partner",
        detail:
          "On = current partner eligible for public listing. Off = historical - kept in the CMS but not treated as active on the site.",
      },
      {
        name: "Logo publication permission",
        detail:
          "Required before the logo is shown publicly. Without permission, a stored logo stays CMS-only / hidden on the public site.",
      },
    ],
  },
  logo: {
    title: "Logo",
    intro: "Brand mark for cards and partner grids.",
    fields: [
      {
        name: "Logo image",
        detail:
          "Uploaded image processed for the site. Public display also depends on logo publication permission. Clear or remove to drop the stored file.",
      },
    ],
  },
} as const satisfies Record<string, AdminFormHelpSection>;
