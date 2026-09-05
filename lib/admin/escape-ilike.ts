/** Escape `\`, `%`, `_` for PostgREST `ilike` patterns. */
export function escapeIlikePattern(value: string): string {
  return value.replace(/[\\%_"]/g, "\\$&");
}
