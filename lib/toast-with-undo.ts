import { toast } from "sonner";

const UNDO_TOAST_MS = 6_000;

type UndoableToastOptions = {
  message: string;
  undoLabel?: string;
  onUndo: () => void | Promise<void>;
};

/**
 * Success toast with a short Undo window for reversible staff actions
 * (publish toggles, archive, flag flips).
 */
export function toastWithUndo({
  message,
  undoLabel = "Undo",
  onUndo,
}: UndoableToastOptions) {
  toast.success(message, {
    duration: UNDO_TOAST_MS,
    action: {
      label: undoLabel,
      onClick: () => {
        void Promise.resolve(onUndo()).catch(() => {
          toast.error("Could not undo. Please try again.");
        });
      },
    },
  });
}
