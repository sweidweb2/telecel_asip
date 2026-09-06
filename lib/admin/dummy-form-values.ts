import { format } from "date-fns";
import { nanoid } from "nanoid";
import type { FieldValues, UseFormReturn } from "react-hook-form";

import { RECOMMENDED_BLOG_CATEGORIES } from "@/constants/blog-categories";
import type { CreateBlogInput } from "@/validations/blog";
import type { CreateCohortInput } from "@/validations/cohort";
import type { EventFormValues } from "@/validations/event";
import type { EvidenceFormValues } from "@/validations/evidence-record";
import type { CreateFounderStoryInput } from "@/validations/founder-story";
import type { ImpactMetricFormValues } from "@/validations/impact-metric";
import type { PartnerFormValues } from "@/validations/partner";
import type { CreateStartupInput } from "@/validations/startup";

function tag() {
  return nanoid(6).toLowerCase();
}

/** Today's calendar date as `yyyy-MM-dd` for create-form defaults. */
export function todayIsoDate() {
  return format(new Date(), "yyyy-MM-dd");
}

/** Relative calendar date as `yyyy-MM-dd` (negative = past). */
function dateOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return format(d, "yyyy-MM-dd");
}

/**
 * Merge dummy values into the live form without changing defaultValues,
 * so Save stays enabled (`isDirty`).
 */
export function applyDummyFormValues<T extends FieldValues>(
  form: UseFormReturn<T>,
  values: Partial<T>,
) {
  form.reset(
    { ...form.getValues(), ...values } as T,
    { keepDefaultValues: true },
  );
}

/** Replace the live form with empty/create defaults; keeps Save dirty. */
export function applyClearFormValues<T extends FieldValues>(
  form: UseFormReturn<T>,
  values: T,
) {
  form.reset(values, { keepDefaultValues: true });
}

export function dummyPartnerValues(): PartnerFormValues {
  const id = tag();
  return {
    name: `Dummy Partner ${id}`,
    org: `Dummy Org ${id}`,
    type: "corporate",
    contribution:
      "Dummy contribution: co-hosts founder sessions and opens market introductions for ASIP startups.",
    isActive: true,
    logoPermission: false,
    link: "https://example.com",
    sortOrder: 10,
  };
}

export function dummyBlogValues(): CreateBlogInput {
  const id = tag();
  return {
    title: `Dummy Insights draft ${id}`,
    slug: `dummy-insights-${id}`,
    summary:
      "Dummy summary for CMS testing. Founders used ASIP sessions to sharpen go-to-market and find early customers.",
    bodyHtml:
      "<p>Dummy body paragraph for editor testing.</p><p>Second paragraph with enough content to exercise the rich-text field.</p>",
    categories: [RECOMMENDED_BLOG_CATEGORIES[0], "Testing"],
    authorName: "Dummy Author",
    status: "draft",
    isFeatured: false,
    startupId: null,
    cohortId: null,
    sources: ["https://example.com/source"],
    metaTitle: `Dummy meta title ${id}`,
    metaDescription:
      "Dummy meta description for SEO fields during CMS testing.",
  };
}

export function dummyStartupValues(
  current: CreateStartupInput,
): CreateStartupInput {
  const id = tag();
  return {
    name: `Dummy Startup ${id}`,
    slug: `dummy-startup-${id}`,
    description:
      "Dummy startup description for portfolio CMS testing. Building tools that help African founders sell faster.",
    status: "draft",
    foundedAt: dateOffset(-400),
    details: {
      ...current.details,
      // Keep cover / focal as-is — images are filled manually.
      coverImageUrl: current.details?.coverImageUrl ?? "",
      imageFocalX: current.details?.imageFocalX ?? 50,
      imageFocalY: current.details?.imageFocalY ?? 50,
      websiteUrl: "https://example.com",
      industry: "Fintech",
      category: "B2B SaaS",
      location: "Lagos, Nigeria",
      cohort: "ASIP 2024",
      countryCode: "NG",
      sector: "Financial services",
      founderNames: "Ada Okonkwo, Kofi Mensah",
      publicOutcome: "Closed first 20 paying customers after ASIP demo day.",
      featured: false,
      foundingYear: 2022,
      team: "8 people across product, sales, and operations.",
      size: "1-10",
      problem:
        "SMEs struggle to get working-capital decisions fast enough to fulfil orders.",
      solution:
        "A credit decisioning API that underwrites invoices in minutes using alternative data.",
      targetMarket: "Growth-stage African SMEs with recurring B2B revenue.",
      businessModel: "SaaS subscription plus success fee on funded volume.",
      fundingGoal: 500000,
      amountRaised: 120000,
    },
  };
}

export function dummyCohortValues(
  current: CreateCohortInput,
): CreateCohortInput {
  const id = tag();
  const year = new Date().getFullYear();
  return {
    year,
    publicLabel: `Dummy Cohort ${year} ${id}`,
    programmeDatesStart: `${year}-02-01`,
    programmeDatesEnd: `${year}-08-31`,
    programmeStatus: "open",
    summary:
      "Dummy cohort summary for CMS testing. Founders test offers, meet customers, and prepare to scale.",
    mediaUrl: "",
    publishStatus: "draft",
    partnerIds: current.partnerIds?.length
      ? current.partnerIds
      : [],
    startupIds: current.startupIds?.length ? current.startupIds : [],
  };
}

export function dummyEventValues(current: EventFormValues): EventFormValues {
  const id = tag();
  return {
    name: `Dummy Event ${id}`,
    eventDate: dateOffset(30),
    location: "Accra, Ghana",
    format: "hybrid",
    speakers: "Amina Diallo\nJames Otieno",
    assets: "https://example.com/deck.pdf\nhttps://example.com/recording",
    outcomes:
      "Dummy outcomes: 40 founders joined; 12 follow-up investor intros booked.",
    publishStatus: "draft",
    startupIds: current.startupIds?.length ? current.startupIds : [],
  };
}

export function dummyEvidenceValues(
  current: EvidenceFormValues,
): EvidenceFormValues {
  return {
    primarySource:
      "Dummy primary source: internal programme report Q1, verified against CRM exports.",
    sourceFileUrl: "https://example.com/evidence-report.pdf",
    measurementPeriodStart: dateOffset(-120),
    measurementPeriodEnd: dateOffset(-30),
    ownerId: current.ownerId || "",
    status: "pending",
    lastVerifiedDate: dateOffset(-7),
    permission: "internal_only",
    reviewDate: dateOffset(14),
  };
}

export function dummyImpactMetricValues(
  current: ImpactMetricFormValues,
): ImpactMetricFormValues {
  const id = tag();
  return {
    claimLabel: `Dummy claim ${id}: founders who completed sales coaching`,
    value: "128",
    unit: "founders",
    periodStart: dateOffset(-180),
    periodEnd: dateOffset(-10),
    geography: "West Africa",
    impactLens: "pipeline",
    displayLocations: "Lagos\nAccra\nAbidjan",
    evidenceId: current.evidenceId || "",
    publishStatus: "pending",
  };
}

export function dummyFounderStoryValues(
  current: CreateFounderStoryInput,
): CreateFounderStoryInput {
  return {
    startupId: current.startupId || "",
    theProblem:
      "Dummy problem: small clinics could not track medicine stock reliably across branches.",
    whatTheyBuilt:
      "Dummy build: a lightweight inventory app that syncs offline and alerts pharmacies before stockouts.",
    theAsipConnection:
      "Dummy ASIP link: the team used cohort workshops to refine pricing and land first hospital pilots.",
    whereTheyAreNow:
      "Dummy traction: live in 18 clinics with a paid annual contract pipeline.",
    founderQuoteText:
      "ASIP helped us talk to real buyers before we overbuilt the product.",
    quoteAttributionName: "Dummy Founder",
    quoteAttributionTitle: "CEO",
    quoteDate: dateOffset(-60),
    quotePermissionStatus: "granted",
    publishStatus: "draft",
  };
}
