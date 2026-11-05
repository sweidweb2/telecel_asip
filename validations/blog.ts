import { z } from "zod";

import { RECOMMENDED_BLOG_CATEGORIES } from "@/constants/blog-categories";
import {
  parseAdminListQuery,
  type RawSearchParams,
} from "@/validations/admin-list-query";

export const BLOG_PAGE_SIZE = 12;
export const BLOG_TITLE_MAX = 200;
export const BLOG_SUMMARY_MAX = 500;
export const BLOG_SLUG_MAX = 120;
export const BLOG_AUTHOR_NAME_MAX = 100;
export const BLOG_CATEGORY_MAX = 40;
export const BLOG_CATEGORIES_MAX = 8;
export const BLOG_BODY_MAX = 200_000;
export const BLOG_SOURCE_MAX = 500;
export const BLOG_SOURCES_MAX = 20;
export const BLOG_META_TITLE_MAX = 120;
export const BLOG_META_DESCRIPTION_MAX = 300;

export const BLOG_STATUSES = ["draft", "published"] as const;
export type BlogStatusInput = (typeof BLOG_STATUSES)[number];

const STREAM_LABELS = new Set<string>(RECOMMENDED_BLOG_CATEGORIES);

const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters")
  .max(BLOG_SLUG_MAX, `Slug must be at most ${BLOG_SLUG_MAX} characters`)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase letters, numbers, and hyphens",
  );

const categorySchema = z
  .string()
  .trim()
  .min(1, "Category cannot be empty")
  .max(BLOG_CATEGORY_MAX, `Category must be at most ${BLOG_CATEGORY_MAX} characters`);

const optionalUuid = z
  .union([z.uuid("Invalid id"), z.literal(""), z.null()])
  .transform((value) => (value === "" || value === null ? null : value));

const optionalMeta = (max: number, label: string) =>
  z
    .union([
      z
        .string()
        .trim()
        .max(max, `${label} must be at most ${max} characters`)
        .refine(
          (value) => value.length === 0 || value.length >= 2,
          `${label} must be at least 2 characters`,
        ),
      z.null(),
    ])
    .transform((value) => (value === null || value.length === 0 ? null : value));

export const blogFieldsSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters")
      .max(BLOG_TITLE_MAX, `Title must be at most ${BLOG_TITLE_MAX} characters`),
    slug: slugSchema,
    summary: z
      .string()
      .trim()
      .min(2, "Summary must be at least 2 characters")
      .max(
        BLOG_SUMMARY_MAX,
        `Summary must be at most ${BLOG_SUMMARY_MAX} characters`,
      ),
    bodyHtml: z.string().max(BLOG_BODY_MAX, "Body is too long"),
    categories: z
      .array(categorySchema)
      .min(1, "Pick a content stream as the first category")
      .max(
        BLOG_CATEGORIES_MAX,
        `At most ${BLOG_CATEGORIES_MAX} categories allowed`,
      ),
    authorName: z
      .string()
      .trim()
      .min(2, "Author name must be at least 2 characters")
      .max(
        BLOG_AUTHOR_NAME_MAX,
        `Author name must be at most ${BLOG_AUTHOR_NAME_MAX} characters`,
      ),
    status: z.enum(BLOG_STATUSES),
    isFeatured: z.boolean(),
    startupId: optionalUuid,
    cohortId: optionalUuid,
    sources: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Source cannot be empty")
          .max(
            BLOG_SOURCE_MAX,
            `Source must be at most ${BLOG_SOURCE_MAX} characters`,
          ),
      )
      .max(BLOG_SOURCES_MAX, `At most ${BLOG_SOURCES_MAX} sources allowed`),
    metaTitle: optionalMeta(BLOG_META_TITLE_MAX, "Meta title"),
    metaDescription: optionalMeta(BLOG_META_DESCRIPTION_MAX, "Meta description"),
  })
  .superRefine((value, ctx) => {
    if (value.isFeatured && value.status !== "published") {
      ctx.addIssue({
        code: "custom",
        path: ["isFeatured"],
        message: "Only published posts can be featured.",
      });
    }
    const stream = value.categories[0];
    if (stream && !STREAM_LABELS.has(stream)) {
      ctx.addIssue({
        code: "custom",
        path: ["categories", 0],
        message:
          "First category must be one of the five ASIP streams (Founder Stories, Portfolio News, Program Updates, Founder Resources, or Partner Perspectives).",
      });
    }
  });

export const createBlogSchema = blogFieldsSchema;

export const updateBlogSchema = blogFieldsSchema.and(
  z.object({
    id: z.uuid("Invalid blog id"),
  }),
);

export const deleteBlogSchema = z.object({
  id: z.uuid("Invalid blog id"),
});

export const updateBlogStatusSchema = z.object({
  id: z.uuid("Invalid blog id"),
  status: z.enum(BLOG_STATUSES),
});

export const blogIdSchema = z.uuid("Invalid blog id");

export const BLOG_IMAGE_KINDS = ["thumbnail", "author"] as const;

export const blogImageTargetSchema = z.object({
  id: z.uuid("Invalid blog id"),
  kind: z.enum(BLOG_IMAGE_KINDS),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export type DeleteBlogInput = z.infer<typeof deleteBlogSchema>;
export type UpdateBlogStatusInput = z.infer<typeof updateBlogStatusSchema>;
export type BlogImageTarget = z.infer<typeof blogImageTargetSchema>;

export const BLOG_LIST_SORTS = [
  "title",
  "status",
  "author_name",
  "updated_at",
  "created_at",
] as const;

export type BlogListSort = (typeof BLOG_LIST_SORTS)[number];

const blogListQueryInputSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  search: z
    .string()
    .trim()
    .max(100)
    .regex(/^[^,%_()]*$/)
    .catch(""),
  status: z.enum(["all", ...BLOG_STATUSES]).catch("all"),
  sort: z.enum(BLOG_LIST_SORTS).catch("created_at"),
  dir: z.enum(["asc", "desc"]).catch("desc"),
});

export type BlogListQuery = z.infer<typeof blogListQueryInputSchema> & {
  pageSize: typeof BLOG_PAGE_SIZE;
};

export function parseBlogListQuery(input: RawSearchParams): BlogListQuery {
  return parseAdminListQuery({
    input,
    schema: blogListQueryInputSchema,
    pageSize: BLOG_PAGE_SIZE,
    defaults: {
      page: "1",
      search: "",
      status: "all",
      sort: "created_at",
      dir: "desc",
    },
  });
}
