import type { PublicPageSlug } from "@/constants/public-pages";

export type AboutStoryFeatureIcon =
  | "rocket"
  | "trending-up"
  | "globe"
  | "heart";

export type AboutStoryStatIcon =
  | "rocket"
  | "users"
  | "map-pin"
  | "star";

export type MarketingStat = {
  icon: AboutStoryStatIcon;
  value: number;
  suffix?: string;
  label: string;
};

export type AboutStoryCopy = {
  title: string;
  paragraphs: string[];
  eyebrow?: string;
  features?: {
    icon: AboutStoryFeatureIcon;
    title: string;
    description: string;
    slug?: PublicPageSlug;
    hash?: string;
    linkLabel?: string;
  }[];
  stats?: MarketingStat[];
  imageCta?: { slug: PublicPageSlug; label: string };
  bottomCta?: { title: string; slug: PublicPageSlug; label: string };
  statsNotice?: string;
};

export type AboutNarrativeBlockCopy = {
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  imageLabel: string;
};

export type AboutBeliefCopy = {
  eyebrow?: string;
  title: string;
  paragraphs: string[];
};

export type AboutTimelineMilestone = {
  year: string;
  description: string;
};

export type AboutTimelineCopy = {
  eyebrow?: string;
  title: string;
  milestones: AboutTimelineMilestone[];
};

/**
 * Leadership message. Keep `published: false` until Telecel Group supplies
 * approved text and image/video — never ship placeholder copy.
 */
export type AboutCeoMessageCopy = {
  published: boolean;
  eyebrow?: string;
  title?: string;
  paragraphs?: string[];
  attribution?: string;
  role?: string;
  imageLabel: string;
};

export type MarketingContentSlug = Exclude<
  PublicPageSlug,
  | "contact"
  | "insights"
  | "terms"
  | "privacy"
  | "programme"
  | "impact"
  | "alumni"
  | "partners"
  | "lab"
>;

export type LegalPageSlug = "terms" | "privacy";

export type LegalSection = {
  title: string;
  paragraphs: string[];
  /** Stable anchor id for deep links (e.g. the footer's cookie preferences). */
  id?: string;
};

export type LegalPageCopy = {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  notice: string;
  sections: LegalSection[];
};

export type MarketingPageCopy = {
  eyebrow: string;
  title: string;
  description: string;
  notice: string;
  sectionTitle: string;
  sectionDescription: string;
  cards: { title: string; description: string }[];
  cta?: { slug: PublicPageSlug; label: string; hash?: string };
  /** Optional animated proof-point counters. Omit until figures are verified. */
  statsSection?: {
    eyebrow?: string;
    title: string;
    description?: string;
    notice?: string;
    stats: MarketingStat[];
  };
  /** About page — story, mission, vision, and following narrative blocks. */
  aboutNarrative?: {
    story: AboutStoryCopy;
    vision: AboutNarrativeBlockCopy;
    mission: AboutNarrativeBlockCopy;
    belief: AboutBeliefCopy;
    timeline: AboutTimelineCopy;
    telecel: AboutNarrativeBlockCopy;
    /** Built and wired; unpublished until approved copy and media arrive. */
    ceoMessage?: AboutCeoMessageCopy;
  };
  /** FAQ page — tabbed question groups below the scroller. */
  tabsSectionTitle?: string;
  tabsSectionDescription?: string;
  tabs?: {
    id: string;
    label: string;
    items: { title: string; description: string }[];
  }[];
  /** FAQ / founders — dedicated CTA block at the bottom. */
  ctaSection?: {
    title: string;
    description: string;
    slug: PublicPageSlug;
    label: string;
    hash?: string;
  };
};

export type HomePlatformStepId =
  | "discover"
  | "build"
  | "connect"
  | "commercialise"
  | "scale";

export type HomePartnerRoleId =
  | "mentors"
  | "investors"
  | "corporates"
  | "technology"
  | "institutions"
  | "ecosystem";

export type HomePageLink = {
  slug: PublicPageSlug;
  label: string;
};

export type ProgrammeJourneyStepId =
  | "discover"
  | "select"
  | "build"
  | "connect"
  | "commercialise"
  | "grow";

export type ProgrammeValueId =
  | "expertise"
  | "network"
  | "intelligence"
  | "investment"
  | "commercial"
  | "visibility"
  | "continuity";

export type AlumniBenefitId =
  | "community"
  | "learning"
  | "opportunities"
  | "visibility"
  | "give-back";

/**
 * Alumni public page. Built and routable; keep unpublished in nav/sitemap
 * until the operating model, benefits and launch are formally confirmed.
 * Phase 1: no login, member dashboard, chat or community platform.
 */
export type AlumniPageCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: HomePageLink;
  };
  purpose: {
    title: string;
    description: string;
  };
  benefits: {
    items: {
      id: AlumniBenefitId;
      title: string;
      description: string;
    }[];
  };
  /** Visitor-facing hold: the network is not confirmed as live. */
  notice: string;
  ctaSection: {
    title: string;
    description: string;
    slug: PublicPageSlug;
    label: string;
  };
};

export type ProgrammePageCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: HomePageLink;
    secondaryCta: HomePageLink;
  };
  audience: {
    eyebrow: string;
    title: string;
    description: string;
  };
  journey: {
    title: string;
    steps: {
      id: ProgrammeJourneyStepId;
      title: string;
      description: string;
    }[];
  };
  value: {
    title: string;
    items: {
      id: ProgrammeValueId;
      title: string;
      description: string;
    }[];
  };
  eligibility: {
    title: string;
    items: string[];
    /** Visitor-facing: exact criteria land when a cohort opens. */
    notice: string;
  };
  ctaSection: {
    title: string;
    description: string;
    slug: PublicPageSlug;
    label: string;
  };
};

export type HomePageCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: HomePageLink;
    secondaryCta: HomePageLink;
  };
  impactYears: {
    title: string;
    description: string;
    metrics: { value: string; label: string }[];
    notice: string;
  };
  platform: {
    title: string;
    description: string;
    steps: {
      id: HomePlatformStepId;
      title: string;
      description: string;
    }[];
  };
  founders: {
    title: string;
    description: string;
    cta: HomePageLink;
    empty: string;
  };
  outcomes: {
    title: string;
    description: string;
    cta: HomePageLink;
    empty: string;
  };
  ecosystem: {
    title: string;
    description: string;
    cta: HomePageLink;
    roles: {
      id: HomePartnerRoleId;
      title: string;
      description: string;
    }[];
  };
  telecel: {
    title: string;
    description: string;
    ctaLabel: string;
  };
  nextChapter: {
    title: string;
    description: string;
    primaryCta: HomePageLink;
    secondaryCta: HomePageLink;
  };
  latest: {
    eyebrow: string;
    title: string;
    description: string;
    cta: HomePageLink;
    empty: string;
  };
};

export type PartnerTypeId =
  | "corporate"
  | "investors"
  | "technology"
  | "development"
  | "mentors"
  | "media";

/**
 * Partners public page. Partner records come from the `partners` table; this
 * copy supplies the surrounding prose and the per-type group labels, keyed by
 * the same ids as the `partner_type` enum.
 */
export type PartnersPageCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    cta: HomePageLink;
  };
  proposition: {
    title: string;
    description: string;
  };
  types: {
    columns: {
      type: string;
      value: string;
      examples: string;
    };
    rows: {
      id: PartnerTypeId;
      type: string;
      value: string;
      examples: string;
    }[];
  };
  logos: {
    title: string;
  };
  ctaSection: {
    title: string;
    description: string;
    slug: PublicPageSlug;
    label: string;
  };
};

export type ImpactLensId =
  | "pipeline"
  | "inclusion"
  | "growth"
  | "commercialisation"
  | "jobs"
  | "sector";

/**
 * Impact public page. Headline metrics stay off the page until each has a
 * source, measurement period, owner, last-verified date and permission status.
 */
export type ImpactPageCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    cta: HomePageLink;
  };
  progress: {
    eyebrow: string;
    title: string;
    description: string;
  };
  lenses: {
    columns: {
      lens: string;
      framing: string;
      evidence: string;
    };
    rows: {
      id: ImpactLensId;
      lens: string;
      framing: string;
      evidence: string;
    }[];
  };
  caseStudy: {
    eyebrow: string;
    title: string;
    templateLabel: string;
    body: string;
    note: string;
  };
  evidenceRule: string;
  ctaSection: {
    title: string;
    description: string;
    slug: PublicPageSlug;
    label: string;
  };
};

export type InsightsStreamId =
  | "founder-stories"
  | "portfolio-news"
  | "programme-updates"
  | "founder-resources"
  | "partner-perspectives";

/**
 * Insights index. Email capture stays off until privacy language, routing
 * and an owner are confirmed — the updates CTA routes to register-interest.
 */
export type InsightsPageCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
  };
  streams: {
    columns: {
      stream: string;
      purpose: string;
      example: string;
    };
    rows: {
      id: InsightsStreamId;
      stream: string;
      purpose: string;
      example: string;
    }[];
  };
  updates: {
    title: string;
    description: string;
    slug: PublicPageSlug;
    label: string;
  };
};
