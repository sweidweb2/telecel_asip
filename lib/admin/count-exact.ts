/**
 * Exact head-count helper for admin list stat cards.
 * Throws on PostgREST error so page data loaders fail loudly.
 */
export function countExact(result: {
  count: number | null;
  error: { message: string } | null;
}): number {
  if (result.error) throw result.error;
  return result.count ?? 0;
}
