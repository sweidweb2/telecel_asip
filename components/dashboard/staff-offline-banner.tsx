"use client";

import { useSyncExternalStore } from "react";
import { WifiOffIcon } from "lucide-react";

function useIsOnline() {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("online", onStoreChange);
      window.addEventListener("offline", onStoreChange);
      return () => {
        window.removeEventListener("online", onStoreChange);
        window.removeEventListener("offline", onStoreChange);
      };
    },
    () => navigator.onLine,
    () => true,
  );
}

/**
 * Non-alarming staff banner when the browser reports offline.
 * Actions that need the network will still fail with toasts; this sets expectation.
 */
export function StaffOfflineBanner() {
  const isOnline = useIsOnline();
  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 border-b border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      <WifiOffIcon className="size-4 shrink-0" aria-hidden />
      <span>
        You are offline. Changes will not save until the connection returns.
      </span>
    </div>
  );
}
