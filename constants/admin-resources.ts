import {
  INVESTOR_ENGAGEMENT_CACHE_TAGS,
  INVESTOR_INTEREST_CACHE_TAGS,
} from "@/constants/investor-intake";
import { ROUTES } from "@/constants/routes";

export type AdminResourceId =
  | "users"
  | "registrations"
  | "applications"
  | "investorInterests"
  | "investorEngagements"
  | "portfolio"
  | "blogs"
  | "cohorts"
  | "partners"
  | "founderStories"
  | "evidence"
  | "impactMetrics"
  | "events"
  | "contactUs"
  | "newsletter";

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
    description: "Create accounts and manage profile access for the Editor and Admin panels.",
    metaTitle: "Users | ASIP Editor",
  },
  registrations: {
    id: "registrations",
    listPath: ROUTES.registrations,
    navTitle: "Registrations",
    pageTitle: "Registrations",
    description:
      "Review and manage Register Interest leads. Official Apply submissions live under Applications.",
    metaTitle: "Registrations | ASIP Editor",
    cacheTags: ["interest-registrations"],
  },
  applications: {
    id: "applications",
    listPath: ROUTES.applications,
    navTitle: "Applications",
    pageTitle: "Applications",
    description:
      "Official Apply submissions. Separate from Register Interest leads - there is no automatic conversion.",
    metaTitle: "Applications | ASIP Editor",
    cacheTags: ["applications"],
  },
  investorInterests: {
    id: "investorInterests",
    listPath: ROUTES.investorInterests,
    navTitle: "Investor interests",
    pageTitle: "Investor interests",
    description:
      "Register Interest leads from investor accounts. Full engagement requests live under Investor engagements.",
    metaTitle: "Investor interests | ASIP Editor",
    cacheTags: INVESTOR_INTEREST_CACHE_TAGS,
  },
  investorEngagements: {
    id: "investorEngagements",
    listPath: ROUTES.investorEngagements,
    navTitle: "Investor engagements",
    pageTitle: "Investor engagements",
    description:
      "Official investor engagement requests from the Apply path. Separate from investor interest leads - there is no automatic conversion.",
    metaTitle: "Investor engagements | ASIP Editor",
    cacheTags: INVESTOR_ENGAGEMENT_CACHE_TAGS,
  },
  portfolio: {
    id: "portfolio",
    listPath: ROUTES.portfolio,
    navTitle: "Startups",
    pageTitle: "Startups",
    description:
      "Manage startups shown on the public portfolio. Only active startups are visible publicly.",
    metaTitle: "Startups | ASIP Editor",
    cacheTags: ["startups"],
  },
  blogs: {
    id: "blogs",
    listPath: ROUTES.blogs,
    navTitle: "Blogs",
    pageTitle: "Blogs",
    description: "Create and manage Insights articles shown on the public site.",
    metaTitle: "Blogs | ASIP Editor",
    cacheTags: ["blogs"],
  },
  cohorts: {
    id: "cohorts",
    listPath: ROUTES.cohorts,
    navTitle: "Cohorts",
    pageTitle: "Cohorts",
    description:
      "Manage program years, publish status, and linked partners and founders.",
    metaTitle: "Cohorts | ASIP Editor",
    cacheTags: ["cohorts"],
  },
  partners: {
    id: "partners",
    listPath: ROUTES.partners,
    navTitle: "Partners",
    pageTitle: "Partners",
    description: "Partners and mentors shown on the public partners page.",
    metaTitle: "Partners | ASIP Editor",
    cacheTags: ["partners"],
  },
  founderStories: {
    id: "founderStories",
    listPath: ROUTES.founderStories,
    navTitle: "Founder stories",
    pageTitle: "Founder stories",
    description:
      "Narrative modules on public founder profiles and Impact case studies when published.",
    metaTitle: "Founder stories | ASIP Editor",
    cacheTags: ["founder-stories"],
  },
  evidence: {
    id: "evidence",
    listPath: ROUTES.evidence,
    navTitle: "Evidence",
    pageTitle: "Evidence",
    description:
      "Internal evidence register for claims and impact metrics. Not listed on the public site.",
    metaTitle: "Evidence | ASIP Editor",
    cacheTags: ["evidence-records"],
  },
  impactMetrics: {
    id: "impactMetrics",
    listPath: ROUTES.impactMetrics,
    navTitle: "Impact metrics",
    pageTitle: "Impact metrics",
    description:
      "Evidence-backed claims. Verified + homepage_module_02 feed the home impact strip; Impact page strip is not wired yet.",
    metaTitle: "Impact metrics | ASIP Editor",
    cacheTags: ["impact-metrics"],
  },
  events: {
    id: "events",
    listPath: ROUTES.events,
    navTitle: "Events",
    pageTitle: "Events",
    description:
      "Program events catalog (speakers, assets, linked startups). No public events marketing page yet.",
    metaTitle: "Events | ASIP Editor",
    cacheTags: ["events"],
  },
  contactUs: {
    id: "contactUs",
    listPath: ROUTES.contactUs,
    navTitle: "Contact us",
    pageTitle: "Contact us",
    description:
      "Review and manage messages submitted from the public contact form.",
    metaTitle: "Contact us | ASIP Editor",
    cacheTags: ["contact-messages"],
  },
  newsletter: {
    id: "newsletter",
    listPath: ROUTES.newsletter,
    navTitle: "Newsletter",
    pageTitle: "Newsletter",
    description:
      "Emails that opted in for ASIP updates. Public signup stays off until privacy and routing are confirmed. Outbound transactional email is not wired yet.",
    metaTitle: "Newsletter | ASIP Editor",
  },
};

export function getAdminResource(id: AdminResourceId): AdminResource {
  return ADMIN_RESOURCES[id];
}
