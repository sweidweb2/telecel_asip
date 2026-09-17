"use server";

import { getCohortLinkOptionsForAdmin, getCohortsForBlogPicker } from "@/data/cohorts";
import { getEvidenceOwnerOptions } from "@/data/evidence-records";
import { getEventStartupOptions } from "@/data/events";
import { getStartupsForStoryPicker } from "@/data/founder-stories";
import { listEvidenceOptionsForAdmin } from "@/data/impact-metrics";
import { getStartupsForBlogPicker } from "@/data/startups";
import { getCurrentUserProfile } from "@/data/users";
import type { CohortLinkOption } from "@/types/cohort";
import type { EvidenceOwnerOption } from "@/types/evidence-record";
import type { EventStartupOption } from "@/types/event";
import type { StartupStoryOption } from "@/types/founder-story";
import type { EvidenceOption } from "@/types/impact-metric";

const MESSAGES = {
  unauthorized: "You do not have permission to load these options.",
} as const;

/** Lazy searchable startup/cohort options for the blog editor. */
export async function loadBlogLinkOptions(input?: {
  /** Shared search applied to both lists when specific searches are omitted. */
  search?: string;
  startupSearch?: string;
  cohortSearch?: string;
  includeStartupId?: string | null;
  includeCohortId?: string | null;
}): Promise<
  | {
      status: "ok";
      startups: { id: string; name: string }[];
      cohorts: { id: string; label: string }[];
    }
  | { status: "error"; message: string }
> {
  const shared = input?.search ?? "";
  const startupSearch = input?.startupSearch ?? shared;
  const cohortSearch = input?.cohortSearch ?? shared;
  const [startupsResult, cohortsResult] = await Promise.all([
    getStartupsForBlogPicker(startupSearch, input?.includeStartupId),
    getCohortsForBlogPicker(cohortSearch, input?.includeCohortId),
  ]);
  if (
    startupsResult.status === "forbidden" ||
    cohortsResult.status === "forbidden"
  ) {
    return { status: "error", message: MESSAGES.unauthorized };
  }
  return {
    status: "ok",
    startups: startupsResult.startups,
    cohorts: cohortsResult.cohorts,
  };
}

/** Lazy search for cohort partner/startup multi-selects. */
export async function loadCohortLinkOptions(
  search = "",
): Promise<
  | {
      status: "ok";
      partners: CohortLinkOption[];
      startups: CohortLinkOption[];
    }
  | { status: "error"; message: string }
> {
  const result = await getCohortLinkOptionsForAdmin(search);
  if (result.status === "forbidden") {
    return { status: "error", message: MESSAGES.unauthorized };
  }
  return {
    status: "ok",
    partners: result.partners,
    startups: result.startups,
  };
}

/** Lazy option load for the event create/edit forms. */
export async function loadEventStartupOptions(
  search = "",
  includeIds: string[] = [],
): Promise<
  | { status: "ok"; options: EventStartupOption[] }
  | { status: "error"; message: string }
> {
  const result = await getEventStartupOptions(search, includeIds);
  if (result.status === "forbidden") {
    return { status: "error", message: MESSAGES.unauthorized };
  }
  return { status: "ok", options: result.options };
}

/** Lazy option load for the evidence editor (owner searchable select). */
export async function loadEvidenceFormOptions(
  search = "",
  includeOwnerId?: string | null,
): Promise<
  | {
      status: "ok";
      owners: EvidenceOwnerOption[];
      defaultOwnerId: string;
    }
  | { status: "error"; message: string }
> {
  const [ownersResult, profile] = await Promise.all([
    getEvidenceOwnerOptions(search, includeOwnerId),
    getCurrentUserProfile(),
  ]);
  if (ownersResult.status === "forbidden") {
    return { status: "error", message: MESSAGES.unauthorized };
  }
  const owners = ownersResult.owners;
  return {
    status: "ok",
    owners,
    defaultOwnerId: profile?.id ?? owners[0]?.id ?? "",
  };
}

/** Lazy option load for the impact metric evidence picker. */
export async function loadImpactEvidenceOptions(
  search = "",
  includeEvidenceId?: string | null,
): Promise<
  | { status: "ok"; options: EvidenceOption[] }
  | { status: "error"; message: string }
> {
  const result = await listEvidenceOptionsForAdmin(search, includeEvidenceId);
  if (result.status === "forbidden") {
    return { status: "error", message: MESSAGES.unauthorized };
  }
  return { status: "ok", options: result.options };
}

/** Lazy searchable startup options for the founder-story editor. */
export async function loadStoryStartupOptions(input?: {
  search?: string;
  includeStartupId?: string;
}): Promise<
  | { status: "ok"; startups: StartupStoryOption[] }
  | { status: "error"; message: string }
> {
  const result = await getStartupsForStoryPicker({
    search: input?.search,
    includeStartupId: input?.includeStartupId,
  });
  if (result.status === "forbidden") {
    return { status: "error", message: MESSAGES.unauthorized };
  }
  return { status: "ok", startups: result.startups };
}
