import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { useCmsEditorForm } from "@/hooks/use-cms-editor-form";

const push = vi.hoisted(() => vi.fn());
const refresh = vi.hoisted(() => vi.fn());
const toastSuccess = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());

vi.mock("nextjs-toploader/app", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("sonner", () => ({
  toast: { success: toastSuccess, error: toastError },
}));

const schema = z.object({
  name: z.string().min(2),
});

const steps = [
  { id: "main", title: "Main", fields: ["name"] },
  { id: "extra", title: "Extra", fields: ["note"] },
] as const;

describe("useCmsEditorForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setup(mode: "create" | "edit" = "create") {
    const create = vi.fn().mockResolvedValue({
      status: "success",
      message: "Created.",
      id: "row-1",
    });
    const update = vi.fn().mockResolvedValue({
      status: "success",
      message: "Saved.",
    });
    const remove = vi.fn().mockResolvedValue({
      status: "success",
      message: "Deleted.",
    });

    const hook = renderHook(() =>
      useCmsEditorForm({
        mode,
        schema,
        defaultValues: { name: "" },
        recordId: mode === "edit" ? "row-1" : undefined,
        listPath: "/dashboard/events",
        detailPath: (id: string) => `/dashboard/events/${id}`,
        create,
        update,
        remove,
        saveError: "Could not save.",
        deleteError: "Could not delete.",
        steps,
      }),
    );

    return { ...hook, create, update, remove };
  }

  it("jumps to the step that owns the first invalid field", () => {
    const { result } = setup();

    act(() => {
      result.current.setStep("extra");
      result.current.onInvalid({
        name: { type: "too_small", message: "Too short" },
      });
    });

    expect(result.current.step).toBe("main");
  });

  it("creates a row and opens its edit page", async () => {
    const { result, create } = setup("create");

    act(() => {
      result.current.onSubmit({ name: "Launch day" });
    });

    await waitFor(() => {
      expect(create).toHaveBeenCalledWith({ name: "Launch day" });
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/dashboard/events/row-1");
    });
    expect(toastSuccess).toHaveBeenCalledWith("Created.");
    expect(refresh).toHaveBeenCalled();
  });

  it("deletes the open record and returns to the list", async () => {
    const { result, remove } = setup("edit");

    act(() => {
      result.current.onDelete();
    });

    await waitFor(() => {
      expect(remove).toHaveBeenCalledWith({ id: "row-1" });
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/dashboard/events");
    });
    expect(toastSuccess).toHaveBeenCalledWith("Deleted.");
  });
});
