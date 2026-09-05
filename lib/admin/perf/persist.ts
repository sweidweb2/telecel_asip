import { createClient } from "@/lib/supabase/server";
import type { AdminPerfEventRecord } from "@/lib/admin/perf/types";
import type { Json } from "@/types/database";

const META_MAX_CHARS = 4000;
const ERROR_MAX_CHARS = 500;

function sanitizeMeta(meta: Record<string, unknown>): Json {
  try {
    const json = JSON.stringify(meta);
    if (json.length <= META_MAX_CHARS) return meta as Json;
    return { truncated: true, preview: json.slice(0, META_MAX_CHARS) };
  } catch {
    return { truncated: true, error: "meta_serialize_failed" };
  }
}

/**
 * Fire-and-forget insert. Never throws to callers; never wrapped in traceAsync.
 */
export function persistAdminPerfEvent(record: AdminPerfEventRecord): void {
  void (async () => {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("admin_perf_events").insert({
        request_id: record.request_id,
        parent_id: record.parent_id,
        event_type: record.event_type,
        name: record.name,
        route: record.route,
        duration_ms: record.duration_ms,
        db_ms: record.db_ms,
        cache_status: record.cache_status,
        ok: record.ok,
        error_message: record.error_message
          ? record.error_message.slice(0, ERROR_MAX_CHARS)
          : null,
        meta: sanitizeMeta(record.meta),
      });
      if (error) {
        console.error("[admin-perf] insert failed", error.message);
      }
    } catch (err) {
      console.error("[admin-perf] persist error", err);
    }
  })();
}
