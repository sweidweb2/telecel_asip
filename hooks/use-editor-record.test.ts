import { beforeEach, describe, expect, it, vi } from "vitest";

import { useEditorRecord } from "@/hooks/use-editor-record";
import { renderHook, waitFor } from "@testing-library/react";

const toastError = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({
  toast: { error: toastError, success: vi.fn() },
}));

describe("useEditorRecord", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads a record when the dialog opens", async () => {
    const load = vi.fn().mockResolvedValue({
      status: "ok",
      record: { id: "a1", name: "Ada" },
    });

    const { result, rerender } = renderHook(
      (props: { open: boolean; id?: string }) =>
        useEditorRecord({
          open: props.open,
          id: props.id,
          load,
        }),
      { initialProps: { open: false, id: undefined as string | undefined } },
    );

    expect(result.current.record).toBeNull();
    expect(load).not.toHaveBeenCalled();

    rerender({ open: true, id: "a1" });

    await waitFor(() => {
      expect(result.current.record).toEqual({ id: "a1", name: "Ada" });
    });
    expect(load).toHaveBeenCalledWith("a1");
  });

  it("toasts when the record is missing", async () => {
    const load = vi.fn().mockResolvedValue({ status: "not_found" });

    renderHook(() =>
      useEditorRecord({
        open: true,
        id: "missing",
        load,
        missingMessage: "Application not found.",
      }),
    );

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Application not found.");
    });
  });
});
