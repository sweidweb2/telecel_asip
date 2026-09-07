/**
 * Kill switch for temporary admin performance instrumentation.
 * Set `ADMIN_PERF_TRACKING=true` in server env to enable.
 */
export function isAdminPerfTrackingEnabled(): boolean {
  return process.env.ADMIN_PERF_TRACKING === "true";
}
