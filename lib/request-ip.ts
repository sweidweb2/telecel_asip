import { headers } from "next/headers";

/**
 * Client IP from proxy headers (`x-forwarded-for`, then `x-real-ip`).
 * Falls back to `"unknown"` when neither is present.
 */
export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headerStore.get("x-real-ip")?.trim() || "unknown";
}
