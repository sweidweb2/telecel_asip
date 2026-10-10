import { describe, expect, it, vi } from "vitest";

import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

import { writeAdminRow } from "./write-admin-row";

const rowId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function client(from: ReturnType<typeof vi.fn>) {
  return { from } as unknown as SupabaseClient<Database>;
}

describe("writeAdminRow", () => {
  it("returns the inserted id", async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: rowId }, error: null });
    const from = vi.fn(() => ({
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single })) })),
    }));

    await expect(
      writeAdminRow(client(from), {
        op: "insert",
        table: "partners",
        values: { name: "Telecel", type: "corporate" },
      }),
    ).resolves.toEqual({ status: "success", id: rowId });

    expect(from).toHaveBeenCalledWith("partners");
  });

  it("returns the not-found message when an update matches no row", async () => {
    const from = vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      })),
    }));

    await expect(
      writeAdminRow(client(from), {
        op: "update",
        table: "partners",
        id: rowId,
        values: { is_active: false },
        notFound: "Partner not found.",
      }),
    ).resolves.toEqual({ status: "error", message: "Partner not found." });
  });

  it("returns a delete constraint error with the delete context", async () => {
    const pgError = { code: "23503", message: "violates foreign key" };
    const from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: { id: rowId }, error: null }),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: pgError }),
      })),
    }));

    await expect(
      writeAdminRow(client(from), {
        op: "delete",
        table: "evidence_records",
        id: rowId,
        notFound: "Evidence record not found.",
        pgContext: "delete",
      }),
    ).resolves.toEqual({ status: "error", pgError, pgContext: "delete" });
  });
});
