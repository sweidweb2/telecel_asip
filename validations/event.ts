import { z } from "zod";

import {
  CMS_PUBLISH_STATUSES,
  type CmsPublishStatus,
} from "@/constants/cms-publish";
import {
  parseAdminListQuery,
  type RawSearchParams,
} from "@/validations/admin-list-query";

export {
  CMS_PUBLISH_STATUSES,
  CMS_PUBLISH_STATUS_LABELS,
  type CmsPublishStatus,
} from "@/constants/cms-publish";

/** @deprecated Prefer `CmsPublishStatus` from `@/constants/cms-publish`. */
export type CmsPublishStatusInput = CmsPublishStatus;

export const EVENT_PAGE_SIZE = 20;

export const EVENT_NAME_MAX = 200;
export const EVENT_LOCATION_MAX = 200;
export const EVENT_OUTCOMES_MAX = 5000;
export const EVENT_SPEAKER_MAX = 120;
export const EVENT_ASSET_URL_MAX = 500;
export const EVENT_SPEAKERS_MAX = 50;
export const EVENT_ASSETS_MAX = 20;

export const EVENT_FORMATS = ["virtual", "in_person", "hybrid"] as const;

export type EventFormatInput = (typeof EVENT_FORMATS)[number];

export const EVENT_FORMAT_LABELS: Record<EventFormatInput, string> = {
  virtual: "Virtual",
  in_person: "In person",
  hybrid: "Hybrid",
};

/** Split a textarea (one value per line) into a trimmed string array. */
function linesToArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }
  if (typeof value !== "string") return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

const speakersField = z.preprocess(
  linesToArray,
  z
    .array(
      z
        .string()
        .min(1)
        .max(
          EVENT_SPEAKER_MAX,
          `Each speaker must be at most ${EVENT_SPEAKER_MAX} characters`,
        ),
    )
    .max(
      EVENT_SPEAKERS_MAX,
      `At most ${EVENT_SPEAKERS_MAX} speakers allowed`,
    ),
);

const assetsField = z.preprocess(
  linesToArray,
  z
    .array(
      z
        .string()
        .max(
          EVENT_ASSET_URL_MAX,
          `Each asset URL must be at most ${EVENT_ASSET_URL_MAX} characters`,
        )
        .refine(
          (value) => /^https?:\/\/.+/i.test(value),
          "Each asset must be a valid http(s) URL",
        ),
    )
    .max(EVENT_ASSETS_MAX, `At most ${EVENT_ASSETS_MAX} assets allowed`),
);

const optionalLocation = z
  .string()
  .trim()
  .max(
    EVENT_LOCATION_MAX,
    `Location must be at most ${EVENT_LOCATION_MAX} characters`,
  )
  .optional()
  .or(z.literal(""));

const optionalOutcomes = z
  .string()
  .trim()
  .max(
    EVENT_OUTCOMES_MAX,
    `Outcomes must be at most ${EVENT_OUTCOMES_MAX} characters`,
  )
  .optional()
  .or(z.literal(""));

const optionalFormat = z
  .union([z.enum(EVENT_FORMATS), z.literal(""), z.null()])
  .optional()
  .transform((value) => {
    if (value === "" || value === null || value === undefined) return null;
    return value;
  });

const eventDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Event date must be YYYY-MM-DD");

const startupIds = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value;
  return [value];
}, z
  .array(z.uuid("Invalid startup id"))
  .max(200)
  .transform((ids) => [...new Set(ids)]));

export const eventFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(
      EVENT_NAME_MAX,
      `Name must be at most ${EVENT_NAME_MAX} characters`,
    ),
  eventDate,
  location: optionalLocation,
  format: optionalFormat,
  speakers: speakersField,
  assets: assetsField,
  outcomes: optionalOutcomes,
  publishStatus: z.enum(CMS_PUBLISH_STATUSES),
  startupIds,
});

export const createEventSchema = eventFieldsSchema;

export const updateEventSchema = eventFieldsSchema.extend({
  id: z.uuid("Invalid event id"),
});

export const deleteEventSchema = z.object({
  id: z.uuid("Invalid event id"),
});

export const eventIdSchema = z.uuid("Invalid event id");

/** Raw form values before Zod coercion (speakers/assets as textarea strings). */
export type EventFormValues = {
  name: string;
  eventDate: string;
  location: string;
  format: EventFormatInput | "";
  speakers: string;
  assets: string;
  outcomes: string;
  publishStatus: CmsPublishStatusInput;
  startupIds: string[];
};

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type DeleteEventInput = z.infer<typeof deleteEventSchema>;

const eventListQueryInputSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  search: z.string().trim().max(100).catch(""),
  status: z.enum(["all", ...CMS_PUBLISH_STATUSES]).catch("all"),
});

export type EventListQuery = z.infer<typeof eventListQueryInputSchema> & {
  pageSize: typeof EVENT_PAGE_SIZE;
};

export function parseEventListQuery(input: RawSearchParams): EventListQuery {
  return parseAdminListQuery({
    input,
    schema: eventListQueryInputSchema,
    pageSize: EVENT_PAGE_SIZE,
    defaults: { page: "1", search: "", status: "all" },
  });
}
