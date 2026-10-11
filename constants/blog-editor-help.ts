import type { AdminFormHelpSection } from "@/types/admin-form-help";

export const BLOG_EDITOR_HELP = {
  basics: {
    title: "Basics",
    intro:
      "Core identity fields for the post. They appear in the CMS list and drive the public Insights URL and byline.",
    fields: [
      {
        name: "Title",
        detail:
          "Main headline on the Insights detail page, listing cards, and Home “Latest” when published. Also used as the browser/SEO title when Meta title is empty.",
      },
      {
        name: "Slug",
        detail:
          "URL path segment for `/en|fr/insights/{slug}`. Must be unique, lowercase, and hyphenated. Changing it after publish breaks old links unless you update bookmarks and shares.",
      },
      {
        name: "Author",
        detail:
          "Display name shown with the article (byline). Not a CMS login - any attribution string is fine.",
      },
    ],
  },
  summary: {
    title: "Summary",
    intro:
      "Short teaser used wherever the full body would be too long.",
    fields: [
      {
        name: "Summary",
        detail:
          "Shown on Insights listing cards and similar previews. Also used as the SEO meta description when Meta description is empty. Keep it concrete and scannable.",
      },
    ],
  },
  body: {
    title: "Body",
    intro: "The full article content readers see on the Insights detail page.",
    fields: [
      {
        name: "Body",
        detail:
          "Rich text for the published article. Only visible on the public site when the post is Published. Reading time is estimated from this HTML on save.",
      },
    ],
  },
  relatedSeo: {
    title: "Related & SEO",
    intro:
      "Optional links and search metadata. Leave blank when not needed - the site falls back to title and summary.",
    fields: [
      {
        name: "Related founder",
        detail:
          "Optional link to one portfolio startup. When set, the public detail page can surface that founder connection. Not required for publishing.",
      },
      {
        name: "Related cohort",
        detail:
          "Optional link to one programme cohort. Shown on the public detail page when set. Not required for publishing.",
      },
      {
        name: "Meta title",
        detail:
          "Optional override for the HTML document title / Open Graph title. If empty, the post Title is used.",
      },
      {
        name: "Meta description",
        detail:
          "Optional override for search and social snippets. If empty, Summary is used. It does not appear in the article layout itself.",
      },
      {
        name: "Sources",
        detail:
          "Citations or URLs shown on the public detail page when present. Not used for SEO. Skip if there are no sources to credit.",
      },
    ],
  },
  publishing: {
    title: "Publishing",
    intro: "Controls who can see the post on Insights and hero placement.",
    fields: [
      {
        name: "Published",
        detail:
          "Off = draft (admin only). On = listed on Insights and reachable by slug. First publish stamps the publish date; unpublishing keeps that date for later republish.",
      },
      {
        name: "Featured",
        detail:
          "Marks this post as the featured Insights post. Only one published post can be featured at a time. Disabled while draft; unpublishing clears the featured flag.",
      },
    ],
  },
  authorAvatar: {
    title: "Author avatar",
    intro: "Optional portrait shown next to the author name on the public article.",
    fields: [
      {
        name: "Avatar image",
        detail:
          "JPEG, PNG, WebP, or GIF up to 10 MB. If missing, the byline still shows the author name without a photo. Not used for SEO.",
      },
    ],
  },
  cover: {
    title: "Cover image",
    intro:
      "Primary visual for listing cards and the article header when published.",
    fields: [
      {
        name: "Cover image",
        detail:
          "JPEG, PNG, WebP, or GIF up to 10 MB. Shown on Insights cards, Home latest, and the detail hero area. Strongly recommended before publishing.",
      },
    ],
  },
  categories: {
    title: "Categories",
    intro:
      "Streams and tags that power Insights filters. At least one category is required.",
    fields: [
      {
        name: "First category (stream)",
        detail:
          "Must be one of the five ASIP streams. Insights listing tabs filter by this stream.",
      },
      {
        name: "Extra tags",
        detail:
          "Optional free-text labels after the stream (up to 8 total). Help with discovery; they are not a substitute for the required stream.",
      },
    ],
  },
} as const satisfies Record<string, AdminFormHelpSection>;
