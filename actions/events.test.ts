import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, revalidateTag, authorizeEditor } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  authorizeEditor: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath,
  revalidateTag,
  unstable_cache: (fn: (...args: never[]) => unknown) => fn,
}));

vi.mock("@/lib/admin/authorize-role", () => ({
  authorizeEditor,
}));

import {
  createEvent,
  deleteEvent,
  updateEvent,
} from "@/actions/events";

const eventId = "55555555-5555-4555-8555-555555555555";

const validCreate = {
  name: "Demo Day",
  eventDate: "2026-06-15",
  location: "",
  format: null as "virtual" | "in_person" | "hybrid" | null,
  speakers: [] as string[],
  assets: [] as string[],
  outcomes: "",
  publishStatus: "draft" as const,
  startupIds: [] as string[],
};

describe("events actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid create input", async () => {
    const result = await createEvent({ ...validCreate, name: "x" });
    expect(result.status).toBe("error");
    expect(authorizeEditor).not.toHaveBeenCalled();
  });

  it("rejects unauthorized create", async () => {
    authorizeEditor.mockResolvedValue({
      status: "error",
      message: "You do not have permission to manage events.",
    });
    await expect(createEvent(validCreate)).resolves.toEqual({
      status: "error",
      message: "You do not have permission to manage events.",
    });
  });

  it("creates, updates, and deletes an event", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({ data: [{ id: eventId }], error: null })
      .mockResolvedValueOnce({ data: [{ id: eventId }], error: null });
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { id: eventId },
      error: null,
    });
    const deleteEq = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle })),
      })),
      delete: vi.fn(() => ({ eq: deleteEq })),
    }));

    authorizeEditor.mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: { rpc, from },
    });

    await expect(createEvent(validCreate)).resolves.toMatchObject({
      status: "success",
      id: eventId,
    });
    await expect(
      updateEvent({ ...validCreate, id: eventId, name: "Demo Day edited" }),
    ).resolves.toMatchObject({ status: "success", id: eventId });
    await expect(deleteEvent({ id: eventId })).resolves.toMatchObject({
      status: "success",
    });
  });
});
