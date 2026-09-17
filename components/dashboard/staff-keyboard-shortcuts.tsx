"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { KeyboardIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  isTypingTarget,
  staffNewItemHref,
} from "@/lib/admin/staff-shortcuts";

const emptySubscribe = () => () => {};

function useIsMacShortcut() {
  return useSyncExternalStore(
    emptySubscribe,
    () =>
      typeof navigator !== "undefined" &&
      /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent),
    () => false,
  );
}

type ShortcutRow = {
  keys: string;
  description: string;
};

/**
 * Staff keyboard shortcuts: ? help, Ctrl/⌘S save, N new item.
 * Mount once in editor/admin layouts. Ctrl/⌘B (sidebar) and Ctrl/⌘K (search)
 * stay in their own components.
 */
export function StaffKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const isMac = useIsMacShortcut();
  const [helpOpen, setHelpOpen] = useState(false);
  const mod = isMac ? "⌘" : "Ctrl";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const typing = isTypingTarget(event.target);

      // "?" opens help (Shift+/). Ignore while typing.
      if (
        !typing &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        event.key === "?"
      ) {
        event.preventDefault();
        setHelpOpen(true);
        return;
      }

      // Ctrl/⌘+S — submit the nearest staff form (save).
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        const form = document.querySelector<HTMLFormElement>(
          "main form, form",
        );
        const submit = form?.querySelector<HTMLButtonElement>(
          'button[type="submit"]:not(:disabled)',
        );
        if (form && submit) {
          event.preventDefault();
          form.requestSubmit(submit);
        }
        return;
      }

      // N — jump to New for the current resource (editor create routes).
      if (
        !typing &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        event.key.toLowerCase() === "n"
      ) {
        const href = staffNewItemHref(pathname);
        if (!href || pathname === href) return;
        event.preventDefault();
        router.push(href);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pathname, router]);

  const rows: ShortcutRow[] = [
    { keys: `${mod}+K`, description: "Search pages and actions" },
    { keys: `${mod}+B`, description: "Toggle sidebar" },
    { keys: `${mod}+S`, description: "Save the current form" },
    { keys: "N", description: "Create a new item for this section" },
    { keys: "?", description: "Show keyboard shortcuts" },
    { keys: "Esc", description: "Close dialogs and menus" },
  ];

  return (
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
      <DialogContent className="max-w-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyboardIcon className="size-5" aria-hidden />
            Keyboard shortcuts
          </DialogTitle>
          <DialogDescription>
            Shortcuts work across the editor and admin panels. They are paused
            while you type in a field.
          </DialogDescription>
        </DialogHeader>
        <ul className="grid gap-2">
          {rows.map((row) => (
            <li
              key={row.keys}
              className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
            >
              <span className="text-muted-foreground">{row.description}</span>
              <kbd className="shrink-0 rounded border bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
                {row.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
