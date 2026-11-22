import { describe, expect, it } from "vitest";

import {
  createEventSchema,
  EVENT_NAME_MAX,
  EVENT_PAGE_SIZE,
  parseEventListQuery,
  updateEventSchema,
} from "@/validations/event";

const base = {
  name: "Demo Day Accra",
  eventDate: "2026-06-15",
  location: "Accra",
  format: "hybrid" as const,
  speakers: "Amina Diallo\nKwame Mensah",
  assets: "https://example.com/deck.pdf",
  outcomes: "Three pilots signed.",
  publishStatus: "draft" as const,
  startupIds: ["550e8400-e29b-41d4-a716-446655440000"],
};

describe("createEventSchema", () => {
  it("accepts a complete event and splits speakers/assets lines", () => {
    const parsed = createEventSchema.parse(base);
    expect(parsed.speakers).toEqual(["Amina Diallo", "Kwame Mensah"]);
    expect(parsed.assets).toEqual(["https://example.com/deck.pdf"]);
    expect(parsed.format).toBe("hybrid");
    expect(parsed.startupIds).toHaveLength(1);
  });

  it("dedupes startup ids", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    const parsed = createEventSchema.parse({
      ...base,
      startupIds: [id, id],
    });
    expect(parsed.startupIds).toEqual([id]);
  });

  it("allows empty optional fields and null format", () => {
    const parsed = createEventSchema.parse({
      name: "Founder Mixer",
      eventDate: "2026-01-01",
      location: "",
      format: "",
      speakers: "",
      assets: "",
      outcomes: "",
      publishStatus: "published",
      startupIds: [],
    });
    expect(parsed.location).toBe("");
    expect(parsed.format).toBeNull();
    expect(parsed.speakers).toEqual([]);
    expect(parsed.assets).toEqual([]);
  });

  it("rejects a short name, bad date, and non-http asset", () => {
    expect(createEventSchema.safeParse({ ...base, name: "A" }).success).toBe(
      false,
    );
    expect(
      createEventSchema.safeParse({
        ...base,
        name: "a".repeat(EVENT_NAME_MAX + 1),
      }).success,
    ).toBe(false);
    expect(
      createEventSchema.safeParse({ ...base, eventDate: "15-06-2026" }).success,
    ).toBe(false);
    expect(
      createEventSchema.safeParse({
        ...base,
        assets: "ftp://example.com/file.pdf",
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown format and publish status", () => {
    expect(
      createEventSchema.safeParse({ ...base, format: "webinar" }).success,
    ).toBe(false);
    expect(
      createEventSchema.safeParse({ ...base, publishStatus: "archived" })
        .success,
    ).toBe(false);
  });
});

describe("updateEventSchema", () => {
  it("requires a uuid id", () => {
    expect(updateEventSchema.safeParse(base).success).toBe(false);
    expect(
      updateEventSchema.safeParse({
        ...base,
        id: "550e8400-e29b-41d4-a716-446655440000",
      }).success,
    ).toBe(true);
  });
});

describe("parseEventListQuery", () => {
  it("applies defaults and page size", () => {
    const query = parseEventListQuery({});
    expect(query).toEqual({
      page: 1,
      search: "",
      status: "all",
      pageSize: EVENT_PAGE_SIZE,
    });
  });

  it("parses search and status from search params", () => {
    const query = parseEventListQuery({
      page: "2",
      search: "  demo  ",
      status: "published",
    });
    expect(query.page).toBe(2);
    expect(query.search).toBe("demo");
    expect(query.status).toBe("published");
  });
});
