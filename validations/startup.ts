import { z } from "zod";

export const STARTUP_PAGE_SIZE = 12;
export const STARTUP_PUBLIC_PAGE_SIZE = 6;

export const STARTUP_NAME_MAX = 120;
export const STARTUP_SLUG_MAX = 120;
export const STARTUP_DESCRIPTION_MAX = 2000;
export const STARTUP_TEXT_SHORT_MAX = 100;
export const STARTUP_LOCATION_MAX = 120;
export const STARTUP_SIZE_MAX = 60;
export const STARTUP_TEAM_MAX = 2000;
export const STARTUP_LONG_TEXT_MAX = 4000;
export const STARTUP_URL_MAX = 500;

export const STARTUP_STATUSES = ["draft", "active", "inactive"] as const;
export type StartupStatusInput = (typeof STARTUP_STATUSES)[number];

const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters")
  .max(STARTUP_SLUG_MAX, `Slug must be at most ${STARTUP_SLUG_MAX} characters`)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase letters, numbers, and hyphens",
  );

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be at most ${max} characters`)
    .optional()
    .or(z.literal(""));

const optionalUrl = z
  .string()
  .trim()
  .max(STARTUP_URL_MAX, `URL must be at most ${STARTUP_URL_MAX} characters`)
  .refine(
    (value) => value === "" || /^https?:\/\/.+/i.test(value),
    "Website must be a valid http(s) URL",
  )
  .optional()
  .or(z.literal(""));

const optionalNonNegativeNumber = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    if (value === "" || value === null || value === undefined) return undefined;
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n)) {
      ctx.addIssue({ code: "custom", message: "Must be a number" });
      return z.NEVER;
    }
    if (n < 0) {
      ctx.addIssue({ code: "custom", message: "Must be zero or greater" });
      return z.NEVER;
    }
    return n;
  });

const optionalFoundingYear = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    if (value === "" || value === null || value === undefined) return undefined;
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      ctx.addIssue({
        code: "custom",
        message: "Founding year must be a whole number",
      });
      return z.NEVER;
    }
    if (n < 1900 || n > 2100) {
      ctx.addIssue({
        code: "custom",
        message: "Founding year must be between 1900 and 2100",
      });
      return z.NEVER;
    }
    return n;
  });

const optionalDate = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Founded date must be YYYY-MM-DD",
  )
  .optional()
  .or(z.literal(""));

export const startupDetailsSchema = z
  .object({
    websiteUrl: optionalUrl,
    industry: optionalText(STARTUP_TEXT_SHORT_MAX),
    category: optionalText(STARTUP_TEXT_SHORT_MAX),
    location: optionalText(STARTUP_LOCATION_MAX),
    foundingYear: optionalFoundingYear,
    team: optionalText(STARTUP_TEAM_MAX),
    size: optionalText(STARTUP_SIZE_MAX),
    problem: optionalText(STARTUP_LONG_TEXT_MAX),
    solution: optionalText(STARTUP_LONG_TEXT_MAX),
    targetMarket: optionalText(STARTUP_TEAM_MAX),
    businessModel: optionalText(STARTUP_TEAM_MAX),
    fundingGoal: optionalNonNegativeNumber,
    amountRaised: optionalNonNegativeNumber,
  })
  .superRefine((value, ctx) => {
    if (
      value.fundingGoal !== undefined &&
      value.amountRaised !== undefined &&
      value.amountRaised > value.fundingGoal
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["amountRaised"],
        message: "Amount raised cannot exceed the funding goal.",
      });
    }
  });

export const startupCoreSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(STARTUP_NAME_MAX, `Name must be at most ${STARTUP_NAME_MAX} characters`),
  slug: slugSchema,
  description: z
    .string()
    .trim()
    .min(2, "Description must be at least 2 characters")
    .max(
      STARTUP_DESCRIPTION_MAX,
      `Description must be at most ${STARTUP_DESCRIPTION_MAX} characters`,
    ),
  status: z.enum(STARTUP_STATUSES),
  foundedAt: optionalDate,
});

/** Form schema — core + optional details (all detail fields nullable). */
export const startupFormSchema = startupCoreSchema.and(
  z.object({
    details: startupDetailsSchema,
  }),
);

/** Create accepts optional details; empty details still insert a linked row. */
export const createStartupSchema = startupFormSchema;

/** Edit form (without id). */
export const editStartupFormSchema = startupFormSchema;

export const updateStartupSchema = startupFormSchema.and(
  z.object({
    id: z.uuid("Invalid startup id"),
  }),
);

export const deleteStartupSchema = z.object({
  id: z.uuid("Invalid startup id"),
});

export type CreateStartupInput = z.infer<typeof createStartupSchema>;
export type UpdateStartupInput = z.infer<typeof updateStartupSchema>;
export type DeleteStartupInput = z.infer<typeof deleteStartupSchema>;

const startupListQueryInputSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  search: z
    .string()
    .trim()
    .max(100)
    .regex(/^[^,%_()]*$/)
    .catch(""),
  status: z.enum(["all", ...STARTUP_STATUSES]).catch("all"),
});

export type StartupListQuery = z.infer<typeof startupListQueryInputSchema> & {
  pageSize: typeof STARTUP_PAGE_SIZE;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseStartupListQuery(input: RawSearchParams): StartupListQuery {
  const parsed = startupListQueryInputSchema.parse({
    page: first(input.page) ?? "1",
    search: first(input.search) ?? "",
    status: first(input.status) ?? "all",
  });

  return {
    ...parsed,
    pageSize: STARTUP_PAGE_SIZE,
  };
}

export function parsePortfolioPageParam(
  value: string | string[] | undefined,
): number {
  const raw = first(value) ?? "1";
  const page = Number.parseInt(raw, 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(page, 10_000);
}
