import { describe, expect, it } from "vitest";

import {
  createFounderStorySchema,
  parseFounderStoryListQuery,
  FOUNDER_STORY_NARRATIVE_MAX,
  FOUNDER_STORY_PAGE_SIZE,
} from "@/validations/founder-story";

const startupId = "11111111-1111-4111-8111-111111111111";

const base = {
  startupId,
  storyTitle: "Opening new markets through partnerships",
  theProblem: "Founders needed a clearer path to customers across markets.",
  whatTheyBuilt: "A marketplace that connects operators with verified demand.",
  theAsipConnection: "ASIP opened intros to mentors and distribution partners.",
  whereTheyAreNow: "Operating in three markets with a growing B2B pipeline.",
  founderQuoteText: "",
  quoteAttributionName: "",
  quoteAttributionTitle: "",
  quoteDate: "",
  quotePermissionStatus: "" as const,
  publishStatus: "draft" as const,
};

describe("createFounderStorySchema", () => {
  it("accepts a draft story without a quote", () => {
    const parsed = createFounderStorySchema.parse({
      ...base,
      publishStatus: "published",
    });
    expect(parsed.publishStatus).toBe("published");
    expect(parsed.founderQuoteText).toBe("");
  });

  it("accepts a draft story with a pending quote and attribution", () => {
    const parsed = createFounderStorySchema.parse({
      ...base,
      founderQuoteText: "ASIP helped us test the idea with real operators.",
      quoteAttributionName: "Amina Diallo",
      quoteAttributionTitle: "Founder",
      quotePermissionStatus: "pending",
      publishStatus: "draft",
    });
    expect(parsed.quotePermissionStatus).toBe("pending");
  });

  it("rejects a quote without attribution or permission", () => {
    expect(
      createFounderStorySchema.safeParse({
        ...base,
        founderQuoteText: "A quote without attribution.",
      }).success,
    ).toBe(false);

    expect(
      createFounderStorySchema.safeParse({
        ...base,
        founderQuoteText: "A quote with a name only.",
        quoteAttributionName: "Amina Diallo",
      }).success,
    ).toBe(false);
  });

  it("rejects publishing a story with a quote unless permission is granted", () => {
    expect(
      createFounderStorySchema.safeParse({
        ...base,
        founderQuoteText: "We grew because the network opened doors.",
        quoteAttributionName: "Amina Diallo",
        quotePermissionStatus: "pending",
        publishStatus: "published",
      }).success,
    ).toBe(false);

    const ok = createFounderStorySchema.parse({
      ...base,
      founderQuoteText: "We grew because the network opened doors.",
      quoteAttributionName: "Amina Diallo",
      quotePermissionStatus: "granted",
      publishStatus: "published",
    });
    expect(ok.quotePermissionStatus).toBe("granted");
  });

  it("rejects short narrative fields and over-long problem text", () => {
    expect(
      createFounderStorySchema.safeParse({ ...base, theProblem: "A" }).success,
    ).toBe(false);
    expect(
      createFounderStorySchema.safeParse({
        ...base,
        theProblem: "a".repeat(FOUNDER_STORY_NARRATIVE_MAX + 1),
      }).success,
    ).toBe(false);
  });
});

describe("parseFounderStoryListQuery", () => {
  it("parses page, search, and status with defaults", () => {
    expect(parseFounderStoryListQuery({})).toEqual({
      page: 1,
      search: "",
      status: "all",
      pageSize: FOUNDER_STORY_PAGE_SIZE,
    });
    expect(
      parseFounderStoryListQuery({
        page: "2",
        search: " Herconomy ",
        status: "published",
      }),
    ).toEqual({
      page: 2,
      search: "Herconomy",
      status: "published",
      pageSize: FOUNDER_STORY_PAGE_SIZE,
    });
  });
});
