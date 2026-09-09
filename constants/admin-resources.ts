import { ROUTES } from "@/constants/routes";

export type AdminResourceId =
  | "users"
  | "registrations"
  | "applications"
  | "portfolio"
  | "blogs"
  | "cohorts"
  | "partners"
  | "founderStories"
  | "evidence"
  | "impactMetrics"
  | "events"
  | "contactUs";

export type AdminResource = {
  id: AdminResourceId;
  listPath: string;
  navTitle: string;
  pageTitle: string;
  description: string;
  metaTitle: string;
  cacheTags?: readonly string[];
};

/**
 * Light CMS resource registry — nav, page copy, list paths, and cache tags.
 * No form schemas or column definitions.
 */
export const ADMIN_RESOURCES: Record<AdminResourceId, AdminResource> = {
  users: {
    id: "users",
    listPath: ROUTES.users,
    navTitle: "Users",
    pageTitle: "Users",
    description: "Create accounts and manage profile access across the CMS.",
    metaTitle: "Users | ASIP Admin",
  },
  registrations: {
    id: "registrations",
    listPath: ROUTES.registrations,
    navTitle: "Registrations",
    pageTitle: "Registrations",
    description:
      "Review and manage Register Interest leads. Official Apply submissions live under Applications.",
    metaTitle: "Registrations | ASIP Admin",
  },
  applications: {
    id: "applications",
    listPath: ROUTES.applications,
    navTitle: "Applications",
    pageTitle: "Applications",
    description:
      "Official Apply submissions. Separate from Register Interest leads — there is no automatic conversion.",
    metaTitle: "Applications | ASIP Admin",
  },
  portfolio: {
    id: "portfolio",
    listPath: ROUTES.portfolio,
    navTitle: "Startup",
    pageTitle: "Startup",
    description:
      "Manage startups shown on the public portfolio. Only active startups are visible publicly.",
    metaTitle: "Startup | ASIP Admin",
    cacheTags: ["startups"],
  },
  blogs: {
    id: "blogs",
    listPath: ROUTES.blogs,
    navTitle: "Blogs",
    pageTitle: "Blogs",
    description: "Create and manage Insights articles shown on the public site.",
    metaTitle: "Blogs | ASIP Admin",
    cacheTags: ["blogs"],
  },
  cohorts: {
    id: "cohorts",
    listPath: ROUTES.cohorts,
    navTitle: "Cohorts",
    pageTitle: "Cohorts",
    description:
      "Manage programme years, publish status, and linked partners and founders.",
    metaTitle: "Cohorts | ASIP Admin",
    cacheTags: ["cohorts"],
  },
  partners: {
    id: "partners",
    listPath: ROUTES.partners,
    navTitle: "Partners",
    pageTitle: "Partners",
    description: "Partners and mentors shown on the public partners page.",
    metaTitle: "Partners | ASIP Admin",
    cacheTags: ["partners"],
  },
  founderStories: {
    id: "founderStories",
    listPath: ROUTES.founderStories,
    navTitle: "Founder stories",
    pageTitle: "Founder stories",
    description:
      "Narrative modules on public founder profiles and Impact case studies when published.",
    metaTitle: "Founder stories | ASIP Admin",
    cacheTags: ["founder-stories"],
  },
  evidence: {
    id: "evidence",
    listPath: ROUTES.evidence,
    navTitle: "Evidence",
    pageTitle: "Evidence",
    description:
      "Internal evidence register for claims and impact metrics. Not listed on the public site.",
    metaTitle: "Evidence | ASIP Admin",
  },
  impactMetrics: {
    id: "impactMetrics",
    listPath: ROUTES.impactMetrics,
    navTitle: "Impact metrics",
    pageTitle: "Impact metrics",
    description:
      "Evidence-backed claims. Verified + homepage_module_02 feed the home impact strip; Impact page strip is not wired yet.",
    metaTitle: "Impact metrics | ASIP Admin",
    cacheTags: ["impact-metrics"],
  },
  events: {
    id: "events",
    listPath: ROUTES.events,
    navTitle: "Events",
    pageTitle: "Events",
    description:
      "Programme events catalogue (speakers, assets, linked startups). No public events marketing page yet.",
    metaTitle: "Events | ASIP Admin",
    cacheTags: ["events"],
  },
  contactUs: {
    id: "contactUs",
    listPath: ROUTES.contactUs,
    navTitle: "Contact us",
    pageTitle: "Contact us",
    description:
      "Review and manage messages submitted from the public contact form.",
    metaTitle: "Contact us | ASIP Admin",
  },
};

export function getAdminResource(id: AdminResourceId): AdminResource {
  return ADMIN_RESOURCES[id];
}
