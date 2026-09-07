import { isAdminPerfTrackingEnabled } from "@/lib/admin/perf/config";
import { cacheStatusFromInvokeCount } from "@/lib/admin/perf/cache-status";
import { bumpAdminPerfInvokeCount } from "@/lib/admin/perf/request-context";
import { traceAsync } from "@/lib/admin/perf/trace";
import type { AdminPerfEventType } from "@/lib/admin/perf/types";

/**
 * Wrap a React.cache'd (or similarly memoized) loader so the first await of a
 * key records `miss` and later awaits of the same key record `hit`.
 *
 * Place this *outside* `cache(...)` so every call site still enters the
 * wrapper (React.cache alone would skip the outer body on hits).
 */
export function wrapCached<TArgs extends unknown[], TResult>(
  name: string,
  options: {
    eventType?: AdminPerfEventType;
    keyFn?: (...args: TArgs) => string;
  },
  fn: (...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult> {
  const eventType = options.eventType ?? "data_read";
  const keyFn =
    options.keyFn ??
    ((...args: TArgs) => {
      try {
        return `${name}:${JSON.stringify(args)}`;
      } catch {
        return `${name}:unserializable`;
      }
    });

  return (...args: TArgs) => {
    if (!isAdminPerfTrackingEnabled()) {
      return fn(...args);
    }

    const cacheKey = keyFn(...args);
    const invoke = bumpAdminPerfInvokeCount(cacheKey);
    const cacheStatus = cacheStatusFromInvokeCount(invoke);

    return traceAsync(
      name,
      {
        eventType,
        cacheStatus,
        meta: { invoke, cacheKey },
      },
      () => fn(...args),
    );
  };
}

export { cacheStatusFromInvokeCount } from "@/lib/admin/perf/cache-status";
