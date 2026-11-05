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
  | ""
  | "contact"
  | "insights"
  | "terms"
  | "privacy"
  | "program"
  | "impact"
  | "alumni"
  | "partners"
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

export type AboutHeroChipKind = "focus" | "chapter";

export type AboutHeroChip = {
  kind: AboutHeroChipKind;
  label: string;
  /** Hide below `sm` when true. */
  hideSm?: boolean;
  /** Hide below `md` when true. */
  hideMd?: boolean;
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
  /** About hero — floating decorative chips (aria-hidden). */
  heroChips?: {
    focusKind: string;
    chapterKind: string;
    chips: AboutHeroChip[];
  };
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

export type HomeOutcomeFeatureId =
  | "businesses"
  | "markets"
  | "readiness";

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

export type ProgrammeAudienceHighlightId = "team" | "product" | "market";

export type AlumniBenefitId =
  | "community"
  | "learning"
  | "opportunities"
  | "visibility"
  | "give-back";

/**
 * Alumni public page. Built and routable; keep `noindex` and out of the sitemap
 * until the Alumni Network is formally launched.
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
    title: string;
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
    highlights: {
      id: ProgrammeAudienceHighlightId;
      label: string;
    }[];
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
    imageAlt: string;
    /**
     * Kept for future cohort-criteria swap; not rendered on the public page.
     * Internal cohort-rule notes must never ship as live copy.
     */
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
  /** Investor | Startup entry pathways shared by the hero and next-chapter CTAs. */
  pathways: {
    prompt: string;
    investor: HomePageLink;
    /** Startup routes to the live intake (apply or register interest). */
    startupLabel: string;
  };
  /** Screen-reader name for the portfolio countries ticker under the cohort film. */
  portfolioMarqueeLabel: string;
  hero: {
    /** Kept for copy parity; brand lives in site chrome, not the hero lockup. */
    brand: string;
    /** Kept for SEO/metadata consumers; not rendered in the hero lockup. */
    eyebrow: string;
    /** Kept for copy parity; Telecel endorsement is not rendered in the hero. */
    endorsement: string;
    title: string;
    /** `title` split into reveal beats; the last beat gets the ASIP spectrum accent. */
    titleLines: string[];
    description: string;
    primaryCta: HomePageLink;
    secondaryCta: HomePageLink;
    /** Kept for copy parity; next-chapter CTA lives in that section, not the hero. */
    nextCohort: { label: string; href: string };
    /**
     * Accessible labels for `HOME_HERO_CONTINUUM` stills, same order.
     * The first entry also labels the hero section.
     */
    continuumAlts: string[];
  };
  /** Home Module 02 — Cohort film (click-to-play; no autoplay download). */
  cohortFilm: {
    eyebrow: string;
    title: string;
    description: string;
    /** Accessible label for the play control before the video mounts. */
    playLabel: string;
    /** Short visible CTA on the play control. */
    watchLabel: string;
    /** Accessible description of the film poster still. */
    posterAlt: string;
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
  outcomes: {
    eyebrow: string;
    title: string;
    description: string;
    features: {
      id: HomeOutcomeFeatureId;
      title: string;
      description: string;
    }[];
    /** Secondary link to the Impact page. Primary intake CTA is wired via `intakeCtaFor`. */
    cta: HomePageLink;
    imageAlt: string;
    insetAlt: string;
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
    /** Chat-style user prompt shown above the answer */
    prompt: string;
    /** Decorative input placeholder (send links out) */
    inputPlaceholder: string;
  };
  nextChapter: {
    eyebrow: string;
    title: string;
    description: string;
    /** 2026 applicant criteria, shown as a checklist under the theme. */
    eligibility: {
      title: string;
      items: string[];
    };
    /**
     * 2026 cohort theme. `status: "working"` renders a "working title" tag
     * until Telecel locks the final wording — swap `name` + flip to "final".
     */
    theme: {
      name: string;
      status: "working" | "final";
      statusLabel: string;
      summary: string;
    };
    /** Practical framing of the AI direction — business problem → applied AI → measurable advantage. */
    pillars: { id: string; label: string; title: string; description: string }[];
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
    /** Plain lead before the gradient accent phrase. */
    titleLead: string;
    /** Phrase rendered with the warm portal gradient. */
    titleAccent: string;
    description: string;
    cta: HomePageLink;
    /** Qualitative proof chips — no unverified capital/count claims. */
    proof: string[];
  };
  proposition: {
    title: string;
    description: string;
  };
  types: {
    title: string;
    description: string;
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
    description: string;
    /** Lead-in before each partner group’s concrete offer, e.g. “What founders get:”. */
    bringsLabel: string;
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
    eyebrow: string;
    title: string;
    description: string;
    footnote: string;
    columns: {
      lens: string;
      framing: string;
      evidence: string;
    };
    rows: {
      id: ImpactLensId;
      lens: string;
      framing: string;
      /** Internal CMS note — not rendered on the public page. */
      evidence: string;
    }[];
  };
  caseStudy: {
    eyebrow: string;
    title: string;
    templateLabel: string;
    /** Internal template — never render as a live founder story. */
    body: string;
    note: string;
    empty: string;
    comingSoon: string;
    readStory: string;
    loadMore: string;
    prevLabel: string;
    nextLabel: string;
    steps: {
      barrier: string;
      support: string;
      outcome: string;
    };
  };
  evidenceRule: {
    eyebrow: string;
    title: string;
    description: string;
    requirements: { id: string; label: string }[];
  };
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
